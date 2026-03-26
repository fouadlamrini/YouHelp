const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const blacklistedTokens = require("../../src/utils/blacklist");

jest.setTimeout(120000);

jest.mock("../../src/services/notification.service", () => ({
  notifyNewRegistration: jest.fn().mockResolvedValue(undefined),
}));

const Role = require("../../src/models/Role");
const User = require("../../src/models/User");
const createApp = require("../../app");

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { ip: "127.0.0.1" },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  await Role.create([
    { name: "super_admin" },
    { name: "etudiant" },
    { name: "admin" },
    { name: "formateur" },
  ]);

  app = createApp();
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  blacklistedTokens.clear();
  await User.deleteMany({});
});

describe("POST /api/auth/register", () => {
  it("should return 201 with user and token on valid body", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "First User",
        email: "first@test.com",
        password: "password123",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe("first@test.com");
    expect(res.body.data.user.role).toBe("super_admin");
  });

  it("should return 400 on invalid body (validation)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "A",
        email: "invalid-email",
        password: "short",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });
});

describe("POST /api/auth/login", () => {
  it("should return 200 with token and user on valid credentials", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login Test",
      email: "login@test.com",
      password: "mypass123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@test.com",
      password: "mypass123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe("login@test.com");
  });

  it("should return 400 on invalid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.com",
      password: "wrong",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });
});

describe("POST /api/auth/logout", () => {
  it("should return 400 when no Authorization header", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("No token provided");
  });

  it("should return 200 and blacklist token so middleware rejects it afterwards", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Logout User",
      email: "logout@test.com",
      password: "pass123",
    });
    const token = registerRes.body.data.token;

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(logoutRes.status).toBe(200);
    expect(blacklistedTokens.has(token)).toBe(true);

    const protectedRes = await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "pass123", newPassword: "newpass" });

    expect(protectedRes.status).toBe(401);
    expect(protectedRes.body.message).toBe("Token has been revoked");
  });
});

describe("POST /api/auth/change-password", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).post("/api/auth/change-password").send({
      currentPassword: "old",
      newPassword: "new",
    });

    expect(res.status).toBe(401);
  });

  it("should return 200 with valid token and correct passwords", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Change Pass User",
      email: "changepass@test.com",
      password: "oldpass",
    });
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "changepass@test.com",
      password: "oldpass",
    });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "oldpass", newPassword: "newpass" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("GET /api/auth/complete-profile-options", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/auth/complete-profile-options");
    expect(res.status).toBe(401);
  });

  it("should return 200 with data (campuses, classes, levels) when token valid", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Options User",
      email: "options@test.com",
      password: "pass123",
    });
    const token = registerRes.body.data.token;

    const res = await request(app)
      .get("/api/auth/complete-profile-options")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("campuses");
    expect(res.body.data).toHaveProperty("classes");
    expect(res.body.data).toHaveProperty("levels");
    expect(Array.isArray(res.body.data.campuses)).toBe(true);
    expect(Array.isArray(res.body.data.classes)).toBe(true);
    expect(Array.isArray(res.body.data.levels)).toBe(true);
  });
});

describe("PUT /api/auth/complete-profile", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).put("/api/auth/complete-profile").send({});
    expect(res.status).toBe(401);
  });

  it("should return 200 with token and valid body", async () => {
    // First user is super_admin with completeProfile: true; use second user (etudiant, completeProfile: false)
    await request(app).post("/api/auth/register").send({
      name: "First Admin",
      email: "admin@test.com",
      password: "pass123",
    });
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Complete User",
      email: "complete@test.com",
      password: "pass123",
    });
    const token = registerRes.body.data.token;

    const res = await request(app)
      .put("/api/auth/complete-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ campus: null, class: null, level: null });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });
});

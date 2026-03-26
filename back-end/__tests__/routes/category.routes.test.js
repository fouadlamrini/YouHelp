const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.setTimeout(120000);

jest.mock("../../src/services/notification.service", () => ({
  notifyNewRegistration: jest.fn().mockResolvedValue(undefined),
}));

const Role = require("../../src/models/Role");
const User = require("../../src/models/User");
const Category = require("../../src/models/Category");
const createApp = require("../../app");

let mongoServer;
let app;

async function registerAndGetToken(payload) {
  const res = await request(app).post("/api/auth/register").send(payload);
  return res.body?.data?.token;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { ip: "127.0.0.1" },
  });
  await mongoose.connect(mongoServer.getUri());

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
  await User.deleteMany({});
  await Category.deleteMany({});
});

describe("Category routes /api/category", () => {
  it("should return 401 on GET /api/category without token", async () => {
    const res = await request(app).get("/api/category");

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it("should return 403 on POST /api/category for etudiant", async () => {
    await registerAndGetToken({
      name: "Super Admin",
      email: "admin-cat@youhelp.test",
      password: "password123",
    });
    const etudiantToken = await registerAndGetToken({
      name: "Etudiant Cat",
      email: "etudiant-cat@youhelp.test",
      password: "password123",
    });

    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${etudiantToken}`)
      .send({ name: "Forbidden Cat" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  it("should create category on POST /api/category for super_admin", async () => {
    const token = await registerAndGetToken({
      name: "Super Admin Two",
      email: "admin-cat-2@youhelp.test",
      password: "password123",
    });

    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "General", icon: "book", color: "#4f46e5" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("General");
  });

  it("should return 400 on POST /api/category with invalid body", async () => {
    const token = await registerAndGetToken({
      name: "Super Admin Three",
      email: "admin-cat-3@youhelp.test",
      password: "password123",
    });

    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it("should return categories on GET /api/category with valid token", async () => {
    const token = await registerAndGetToken({
      name: "Super Admin Four",
      email: "admin-cat-4@youhelp.test",
      password: "password123",
    });
    await Category.create({ name: "JS" });
    await Category.create({ name: "Node" });

    const res = await request(app)
      .get("/api/category")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });
});


const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.setTimeout(120000);

jest.mock("../../src/services/notification.service", () => ({
  notifyNewRegistration: jest.fn().mockResolvedValue(undefined),
}));

const Role = require("../../src/models/Role");
const User = require("../../src/models/User");
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
  await User.deleteMany({});
});

describe("Role routes /api/roles", () => {
  it("should return 401 on GET /api/roles without token", async () => {
    const res = await request(app).get("/api/roles");

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it("should return 403 on GET /api/roles for etudiant", async () => {
    await registerAndGetToken({
      name: "Super Admin",
      email: "admin-role@youhelp.test",
      password: "password123",
    });
    const etudiantToken = await registerAndGetToken({
      name: "Etudiant User",
      email: "etudiant-role@youhelp.test",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/roles")
      .set("Authorization", `Bearer ${etudiantToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  it("should return roles on GET /api/roles for super_admin", async () => {
    const token = await registerAndGetToken({
      name: "Super Admin Two",
      email: "admin-role-2@youhelp.test",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/roles")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    const roleNames = res.body.data.map((r) => r.name);
    expect(roleNames).toEqual(expect.arrayContaining(["super_admin", "admin", "formateur", "etudiant"]));
  });
});

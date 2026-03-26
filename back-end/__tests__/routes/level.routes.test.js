const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.setTimeout(120000);

jest.mock("../../src/services/notification.service", () => ({
  notifyNewRegistration: jest.fn().mockResolvedValue(undefined),
}));

const Role = require("../../src/models/Role");
const User = require("../../src/models/User");
const Level = require("../../src/models/Level");
const createApp = require("../../app");

let mongoServer;
let app;

async function registerSuperAdminAndGetToken() {
  const res = await request(app).post("/api/auth/register").send({
    name: "Super Admin",
    email: "admin-level@youhelp.test",
    password: "password123",
  });
  return res.body.data.token;
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
  await Level.deleteMany({});
});

describe("Level routes /api/level", () => {
  it("should return 404 on GET /api/level when no levels exist", async () => {
    const token = await registerSuperAdminAndGetToken();

    const res = await request(app)
      .get("/api/level")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No levels found");
  });

  it("should create level on POST /api/level with valid body", async () => {
    const token = await registerSuperAdminAndGetToken();

    const res = await request(app)
      .post("/api/level")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Beginner" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe("Beginner");
  });

  it("should return 400 when creating level with existing name", async () => {
    const token = await registerSuperAdminAndGetToken();

    await request(app)
      .post("/api/level")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Advanced" });

    const res = await request(app)
      .post("/api/level")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Advanced" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Level already exists");
  });

  it("should return 400 on POST /api/level with invalid body (validation)", async () => {
    const token = await registerSuperAdminAndGetToken();

    const res = await request(app)
      .post("/api/level")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it("should get level by id on GET /api/level/:id", async () => {
    const token = await registerSuperAdminAndGetToken();

    const createRes = await request(app)
      .post("/api/level")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Intermediate" });

    const id = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/level/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(id);
  });

  it("should return 404 on GET /api/level/:id when not found", async () => {
    const token = await registerSuperAdminAndGetToken();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/level/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Level not found");
  });

  it("should update level on PUT /api/level/:id", async () => {
    const token = await registerSuperAdminAndGetToken();

    const createRes = await request(app)
      .post("/api/level")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Old Level" });

    const id = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/level/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Level" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("New Level");
  });

  it("should return 404 on PUT /api/level/:id when level does not exist", async () => {
    const token = await registerSuperAdminAndGetToken();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .put(`/api/level/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Does Not Matter" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Level not found");
  });

  it("should delete level on DELETE /api/level/:id", async () => {
    const token = await registerSuperAdminAndGetToken();

    const createRes = await request(app)
      .post("/api/level")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "To Delete" });

    const id = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/level/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Level deleted successfully");
  });

  it("should return 404 on DELETE /api/level/:id when level not found", async () => {
    const token = await registerSuperAdminAndGetToken();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/level/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Level not found");
  });
});


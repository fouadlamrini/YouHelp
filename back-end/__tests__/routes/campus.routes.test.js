const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.setTimeout(120000);

jest.mock("../../src/services/notification.service", () => ({
  notifyNewRegistration: jest.fn().mockResolvedValue(undefined),
}));

const Role = require("../../src/models/Role");
const User = require("../../src/models/User");
const Campus = require("../../src/models/Campus");
const createApp = require("../../app");

let mongoServer;
let app;

async function registerSuperAdminAndGetToken() {
  const res = await request(app).post("/api/auth/register").send({
    name: "Super Admin",
    email: "admin@youhelp.test",
    password: "password123",
  });
  return res.body.data.token;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
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
  await Campus.deleteMany({});
});

describe("Campus routes /api/campus", () => {
  it("should return 404 on GET /api/campus when no campuses exist", async () => {
    const token = await registerSuperAdminAndGetToken();

    const res = await request(app)
      .get("/api/campus")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No campuses found");
  });

  it("should create campus on POST /api/campus with valid body", async () => {
    const token = await registerSuperAdminAndGetToken();

    const res = await request(app)
      .post("/api/campus")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "YouCode Safi" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe("YouCode Safi");
  });

  it("should return 400 when creating campus with existing name", async () => {
    const token = await registerSuperAdminAndGetToken();

    await request(app)
      .post("/api/campus")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "YouCode Safi" });

    const res = await request(app)
      .post("/api/campus")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "YouCode Safi" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Campus already exists");
  });

  it("should return 400 on POST /api/campus with invalid body (validation)", async () => {
    const token = await registerSuperAdminAndGetToken();

    const res = await request(app)
      .post("/api/campus")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it("should get campus by id on GET /api/campus/:id", async () => {
    const token = await registerSuperAdminAndGetToken();

    const createRes = await request(app)
      .post("/api/campus")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "YouCode Youssoufia" });

    const id = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/campus/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(id);
  });

  it("should return 404 on GET /api/campus/:id when not found", async () => {
    const token = await registerSuperAdminAndGetToken();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/campus/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Campus not found");
  });

  it("should update campus on PUT /api/campus/:id", async () => {
    const token = await registerSuperAdminAndGetToken();

    const createRes = await request(app)
      .post("/api/campus")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Old Name" });

    const id = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/campus/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("New Name");
  });

  it("should return 404 on PUT /api/campus/:id when campus does not exist", async () => {
    const token = await registerSuperAdminAndGetToken();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .put(`/api/campus/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Does Not Matter" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Campus not found");
  });

  it("should delete campus on DELETE /api/campus/:id", async () => {
    const token = await registerSuperAdminAndGetToken();

    const createRes = await request(app)
      .post("/api/campus")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "To Delete" });

    const id = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/campus/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Campus deleted successfully");
  });

  it("should return 404 on DELETE /api/campus/:id when campus not found", async () => {
    const token = await registerSuperAdminAndGetToken();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/campus/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Campus not found");
  });
});


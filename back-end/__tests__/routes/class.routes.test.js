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
const Class = require("../../src/models/Class");
const createApp = require("../../app");

let mongoServer;
let app;

async function registerSuperAdminAndGetToken() {
  const res = await request(app).post("/api/auth/register").send({
    name: "Super Admin",
    email: "admin-class@youhelp.test",
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
  await Campus.deleteMany({});
  await Class.deleteMany({});
});

describe("Class routes /api/class", () => {
  it("should return 404 on GET /api/class when no classes exist", async () => {
    const token = await registerSuperAdminAndGetToken();

    const res = await request(app)
      .get("/api/class")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No classes found");
  });

  it("should create class on POST /api/class with valid body", async () => {
    const token = await registerSuperAdminAndGetToken();

    const campus = await Campus.create({ name: "YouCode Safi" });

    const res = await request(app)
      .post("/api/class")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Class A",
        nickName: "A1",
        year: 2024,
        campus: campus._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe("Class A");
    expect(res.body.data.campus.name).toBe("YouCode Safi");
  });

  it("should return 400 when creating class with non-existing campus", async () => {
    const token = await registerSuperAdminAndGetToken();

    const fakeCampusId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post("/api/class")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Class B",
        campus: fakeCampusId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Campus not found");
  });

  it("should return 400 on POST /api/class with invalid body (validation)", async () => {
    const token = await registerSuperAdminAndGetToken();

    const res = await request(app)
      .post("/api/class")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it("should get class by id on GET /api/class/:id", async () => {
    const token = await registerSuperAdminAndGetToken();

    const campus = await Campus.create({ name: "YouCode Youssoufia" });

    const createRes = await request(app)
      .post("/api/class")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Class Y",
        campus: campus._id.toString(),
      });

    const id = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/class/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(id);
    expect(res.body.data.campus.name).toBe("YouCode Youssoufia");
  });

  it("should return 404 on GET /api/class/:id when not found", async () => {
    const token = await registerSuperAdminAndGetToken();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/class/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Class not found");
  });

  it("should update class on PUT /api/class/:id", async () => {
    const token = await registerSuperAdminAndGetToken();

    const campus = await Campus.create({ name: "YouCode Safi" });

    const createRes = await request(app)
      .post("/api/class")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Old Class",
        campus: campus._id.toString(),
      });

    const id = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/class/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Class" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("New Class");
  });

  it("should return 404 on PUT /api/class/:id when class does not exist", async () => {
    const token = await registerSuperAdminAndGetToken();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .put(`/api/class/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Does Not Matter" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Class not found");
  });

  it("should delete class on DELETE /api/class/:id", async () => {
    const token = await registerSuperAdminAndGetToken();

    const campus = await Campus.create({ name: "YouCode Safi" });

    const createRes = await request(app)
      .post("/api/class")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "To Delete Class",
        campus: campus._id.toString(),
      });

    const id = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/class/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Class deleted successfully");
  });

  it("should return 404 on DELETE /api/class/:id when class not found", async () => {
    const token = await registerSuperAdminAndGetToken();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/class/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Class not found");
  });
});


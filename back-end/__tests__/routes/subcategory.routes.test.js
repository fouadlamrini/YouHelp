const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.setTimeout(120000);

jest.mock("../../src/services/notification.service", () => ({
  notifyNewRegistration: jest.fn().mockResolvedValue(undefined),
  notifyPostDeleted: jest.fn().mockResolvedValue(undefined),
  notifyPostSolved: jest.fn().mockResolvedValue(undefined),
}));

const Role = require("../../src/models/Role");
const User = require("../../src/models/User");
const Category = require("../../src/models/Category");
const SubCategory = require("../../src/models/SubCategory");
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
  await SubCategory.deleteMany({});
});

describe("SubCategory routes /api/subcategory", () => {
  it("should return 401 on GET /api/subcategory without token", async () => {
    const res = await request(app).get("/api/subcategory");
    expect(res.status).toBe(401);
  });

  it("should return 403 on POST /api/subcategory for etudiant", async () => {
    await registerAndGetToken({
      name: "Super Admin",
      email: "subcat-admin@youhelp.test",
      password: "password123",
    });
    const etudiantToken = await registerAndGetToken({
      name: "Etudiant User",
      email: "subcat-etudiant@youhelp.test",
      password: "password123",
    });

    const category = await Category.create({ name: "General" });

    const res = await request(app)
      .post("/api/subcategory")
      .set("Authorization", `Bearer ${etudiantToken}`)
      .send({ name: "JS", category: category.name });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  it("should create and list subcategories on GET /api/subcategory", async () => {
    const token = await registerAndGetToken({
      name: "Super Admin Two",
      email: "subcat-admin-2@youhelp.test",
      password: "password123",
    });

    const category = await Category.create({ name: "Tech" });

    const created = await request(app)
      .post("/api/subcategory")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Node", category: category.name });

    expect(created.status).toBe(201);
    expect(created.body.success).toBe(true);
    expect(created.body.data.name).toBe("Node");

    const listRes = await request(app)
      .get("/api/subcategory")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0].category.name).toBe("Tech");
  });

  it("should get subcategories by category on GET /api/subcategory/category/:categoryId", async () => {
    const token = await registerAndGetToken({
      name: "Super Admin Three",
      email: "subcat-admin-3@youhelp.test",
      password: "password123",
    });

    const category = await Category.create({ name: "Science" });

    await request(app)
      .post("/api/subcategory")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Physics", category: category.name });

    const res = await request(app)
      .get(`/api/subcategory/category/${category._id.toString()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe("Physics");
  });

  it("should update and delete subcategory", async () => {
    const token = await registerAndGetToken({
      name: "Super Admin Four",
      email: "subcat-admin-4@youhelp.test",
      password: "password123",
    });

    const cat1 = await Category.create({ name: "General" });
    const cat2 = await Category.create({ name: "UpdatedCat" });

    const created = await request(app)
      .post("/api/subcategory")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "React", category: cat1.name });

    const subId = created.body.data._id.toString();

    const updated = await request(app)
      .put(`/api/subcategory/${subId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "ReactJS", category: cat2.name });

    expect(updated.status).toBe(200);
    expect(updated.body.success).toBe(true);
    expect(updated.body.data.name).toBe("ReactJS");
    expect(updated.body.data.category.toString()).toBe(cat2._id.toString());

    const deleted = await request(app)
      .delete(`/api/subcategory/${subId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleted.status).toBe(200);
    expect(deleted.body.success).toBe(true);
  });
});


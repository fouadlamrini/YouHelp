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
const Post = require("../../src/models/Post");
const createApp = require("../../app");

let mongoServer;
let app;

async function registerSuperAdminAndGetToken() {
  const res = await request(app).post("/api/auth/register").send({
    name: "Super Admin",
    email: "admin-post@youhelp.test",
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
  await Category.deleteMany({});
  await Post.deleteMany({});
});

describe("Post routes /api/post", () => {
  it("should return 401 on POST /api/post without token", async () => {
    const category = await Category.create({ name: "General" });
    const res = await request(app)
      .post("/api/post")
      .send({ content: "Unauthorized post", category: category.name });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("should create post on POST /api/post with valid body", async () => {
    const token = await registerSuperAdminAndGetToken();
    const category = await Category.create({ name: "General" });

    const res = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "My first post",
        category: category.name,
        type: "post",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.content).toBe("My first post");
  });

  it("should return 400 when category does not exist", async () => {
    const token = await registerSuperAdminAndGetToken();

    const res = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "Invalid category post",
        category: "UnknownCategory",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Category not found");
  });

  it("should get post by id on GET /api/post/:id", async () => {
    const token = await registerSuperAdminAndGetToken();
    const category = await Category.create({ name: "Tech" });

    const createRes = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "Readable post",
        category: category.name,
      });

    const postId = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/post/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(postId);
    expect(res.body.data.content).toBe("Readable post");
  });
});


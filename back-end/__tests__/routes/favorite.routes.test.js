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
const Favorite = require("../../src/models/Favorite");
const createApp = require("../../app");

const blacklistedTokens = require("../../src/utils/blacklist");

let mongoServer;
let app;

async function registerSuperAdminAndGetToken(email) {
  const res = await request(app).post("/api/auth/register").send({
    name: "Super Admin",
    email,
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
  blacklistedTokens.clear();
  await User.deleteMany({});
  await Category.deleteMany({});
  await Post.deleteMany({});
  await Favorite.deleteMany({});
});

describe("Favorites routes /api/favorites", () => {
  it("should return 401 on GET /api/favorites without token", async () => {
    const res = await request(app).get("/api/favorites");
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it("should add favorite and prevent duplicates", async () => {
    const email = "fav@youhelp.test";
    const token = await registerSuperAdminAndGetToken(email);
    const user = await User.findOne({ email });

    const category = await Category.create({ name: "General" });
    const post = await Post.create({
      type: "post",
      content: "My first post",
      author: user._id,
      category: category._id,
    });

    const addRes = await request(app)
      .post("/api/favorites")
      .set("Authorization", `Bearer ${token}`)
      .send({
        contentType: "post",
        contentId: post._id.toString(),
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.success).toBe(true);
    expect(addRes.body.data).toBeDefined();
    expect(addRes.body.data.post.toString()).toBe(post._id.toString());

    const dupRes = await request(app)
      .post("/api/favorites")
      .set("Authorization", `Bearer ${token}`)
      .send({
        contentType: "post",
        contentId: post._id.toString(),
      });

    expect(dupRes.status).toBe(400);
    expect(dupRes.body.message).toBe("Ce contenu est déjà dans vos favoris");
  });

  it("should return isFavorite=true/false from /api/favorites/check/:contentType/:contentId", async () => {
    const email = "fav-check@youhelp.test";
    const token = await registerSuperAdminAndGetToken(email);
    const user = await User.findOne({ email });

    const category = await Category.create({ name: "Tech" });
    const post = await Post.create({
      type: "post",
      content: "Readable post",
      author: user._id,
      category: category._id,
    });

    const before = await request(app)
      .get(`/api/favorites/check/post/${post._id.toString()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(before.status).toBe(200);
    expect(before.body.success).toBe(true);
    expect(before.body.isFavorite).toBe(false);

    await request(app)
      .post("/api/favorites")
      .set("Authorization", `Bearer ${token}`)
      .send({
        contentType: "post",
        contentId: post._id.toString(),
      });

    const after = await request(app)
      .get(`/api/favorites/check/post/${post._id.toString()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(after.status).toBe(200);
    expect(after.body.success).toBe(true);
    expect(after.body.isFavorite).toBe(true);
  });

  it("should return favorites array without pagination metadata", async () => {
    const email = "fav-list@youhelp.test";
    const token = await registerSuperAdminAndGetToken(email);
    const user = await User.findOne({ email });

    const category = await Category.create({ name: "General" });
    const post1 = await Post.create({
      type: "post",
      content: "Post 1",
      author: user._id,
      category: category._id,
    });
    const post2 = await Post.create({
      type: "post",
      content: "Post 2",
      author: user._id,
      category: category._id,
    });

    await request(app)
      .post("/api/favorites")
      .set("Authorization", `Bearer ${token}`)
      .send({ contentType: "post", contentId: post1._id.toString() });

    await request(app)
      .post("/api/favorites")
      .set("Authorization", `Bearer ${token}`)
      .send({ contentType: "post", contentId: post2._id.toString() });

    const res = await request(app)
      .get("/api/favorites")
      .set("Authorization", `Bearer ${token}`)
      .query({ page: 1, limit: 10 }); // should be ignored

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data.favorites)).toBe(true);
    expect(res.body.data.favorites.length).toBe(2);
    expect(res.body.data.pagination).toBeUndefined();
  });
});


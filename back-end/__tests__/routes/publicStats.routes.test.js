const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.setTimeout(120000);

jest.mock("../../src/services/notification.service", () => ({
  notifyNewRegistration: jest.fn().mockResolvedValue(undefined),
}));

const Role = require("../../src/models/Role");
const User = require("../../src/models/User");
const Post = require("../../src/models/Post");
const Category = require("../../src/models/Category");
const createApp = require("../../app");

let mongoServer;
let app;

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
  await Post.deleteMany({});
  await Category.deleteMany({});
});

describe("Public stats routes GET /api/public-stats", () => {
  it("should return 200 without authentication", async () => {
    const res = await request(app).get("/api/public-stats");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data).toHaveProperty("activeStudents");
    expect(res.body.data).toHaveProperty("solvedPosts");
    expect(res.body.data).toHaveProperty("totalFormateurs");
  });

  it("should return counts matching database state", async () => {
    const etudiantRole = await Role.findOne({ name: "etudiant" });
    const formateurRole = await Role.findOne({ name: "formateur" });

    await User.create([
      { email: "e1@test.com", password: "pass123", role: etudiantRole._id, status: "active" },
      { email: "e2@test.com", password: "pass123", role: etudiantRole._id, status: "active" },
      { email: "e3@test.com", password: "pass123", role: etudiantRole._id, status: "pending" },
    ]);
    await User.create([
      { email: "f1@test.com", password: "pass123", role: formateurRole._id, status: "active" },
      { email: "f2@test.com", password: "pass123", role: formateurRole._id, status: "active" },
    ]);

    const category = await Category.create({ name: "CatForStats" });
    const author = await User.findOne({ email: "e1@test.com" });

    await Post.create([
      { content: "p1", author: author._id, category: category._id, isSolved: true },
      { content: "p2", author: author._id, category: category._id, isSolved: true },
      { content: "p3", author: author._id, category: category._id, isSolved: false },
    ]);

    const res = await request(app).get("/api/public-stats");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.activeStudents).toBe(2);
    expect(res.body.data.solvedPosts).toBe(2);
    expect(res.body.data.totalFormateurs).toBe(2);
  });
});

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.setTimeout(120000);

jest.mock("../../src/services/notification.service", () => ({
  notifyNewRegistration: jest.fn().mockResolvedValue(undefined),
}));

const Role = require("../../src/models/Role");
const User = require("../../src/models/User");
const Friend = require("../../src/models/Friend");
const FriendRequest = require("../../src/models/FriendRequest");
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
  await Friend.deleteMany({});
  await FriendRequest.deleteMany({});
});

describe("Friend routes /api/friends", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/friends");
    expect(res.status).toBe(401);
  });

  it("should add friend request then list and remove friendship", async () => {
    const tokenA = await registerAndGetToken({
      name: "Friend A",
      email: "friend-a@test.com",
      password: "password123",
    });

    await registerAndGetToken({
      name: "Friend B",
      email: "friend-b@test.com",
      password: "password123",
    });
    await User.findOneAndUpdate({ email: "friend-b@test.com" }, { status: "active" });
    const loginB = await request(app).post("/api/auth/login").send({
      email: "friend-b@test.com",
      password: "password123",
    });
    const tokenB = loginB.body.data.token;
    const userA = await User.findOne({ email: "friend-a@test.com" }).lean();
    const userB = await User.findOne({ email: "friend-b@test.com" }).lean();

    const addRes = await request(app)
      .post("/api/friends")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ userId: userB._id.toString() });

    expect(addRes.status).toBe(201);
    expect(addRes.body.success).toBe(true);
    expect(addRes.body.data).toBeDefined();

    // Accept the created friend request from B side
    const pending = await FriendRequest.findOne({
      fromUser: userA._id,
      toUser: userB._id,
      status: "pending",
    }).lean();
    expect(pending).toBeTruthy();

    const acceptRes = await request(app)
      .put(`/api/friend-requests/${pending._id.toString()}/accept`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(acceptRes.status).toBe(200);

    const listRes = await request(app)
      .get("/api/friends")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0]._id.toString()).toBe(userB._id.toString());

    const removeRes = await request(app)
      .delete(`/api/friends/${userB._id.toString()}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(removeRes.status).toBe(200);
    expect(removeRes.body.success).toBe(true);
    expect(removeRes.body.message).toBe("Friend removed");
  });
});


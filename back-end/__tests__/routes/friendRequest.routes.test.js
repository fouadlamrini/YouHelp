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

describe("Friend Request routes /api/friend-requests", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/friend-requests/received");
    expect(res.status).toBe(401);
  });

  it("should return 403 for non-active account (requireActive)", async () => {
    await registerAndGetToken({
      name: "Bootstrap Admin",
      email: "bootstrap-fr@test.com",
      password: "password123",
    }); // first user becomes active super_admin

    const pendingToken = await registerAndGetToken({
      name: "Pending User",
      email: "pending-fr@test.com",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/friend-requests/available-users")
      .set("Authorization", `Bearer ${pendingToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Accès réservé aux comptes activés");
  });

  it("should send friend request, list received, and accept", async () => {
    // First user => super_admin active by default
    const tokenA = await registerAndGetToken({
      name: "User A",
      email: "user-a-fr@test.com",
      password: "password123",
    });

    // Second user => activate manually
    await registerAndGetToken({
      name: "User B",
      email: "user-b-fr@test.com",
      password: "password123",
    });
    await User.findOneAndUpdate({ email: "user-b-fr@test.com" }, { status: "active" });
    const loginB = await request(app).post("/api/auth/login").send({
      email: "user-b-fr@test.com",
      password: "password123",
    });
    const tokenB = loginB.body.data.token;
    const userB = await User.findOne({ email: "user-b-fr@test.com" }).lean();

    // A sends to B
    const sendRes = await request(app)
      .post("/api/friend-requests")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ toUserId: userB._id.toString() });

    expect(sendRes.status).toBe(201);
    expect(sendRes.body.success).toBe(true);
    expect(sendRes.body.data).toBeDefined();

    // Duplicate send should fail
    const dupRes = await request(app)
      .post("/api/friend-requests")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ toUserId: userB._id.toString() });

    expect(dupRes.status).toBe(400);
    expect(dupRes.body.message).toBe("Request already sent or received");

    // B sees received request
    const receivedRes = await request(app)
      .get("/api/friend-requests/received")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(receivedRes.status).toBe(200);
    expect(receivedRes.body.success).toBe(true);
    expect(Array.isArray(receivedRes.body.data)).toBe(true);
    expect(receivedRes.body.data.length).toBe(1);

    const reqId = receivedRes.body.data[0]._id;

    // B accepts
    const acceptRes = await request(app)
      .put(`/api/friend-requests/${reqId}/accept`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.success).toBe(true);
    expect(acceptRes.body.message).toBe("Friend added");

    const friendship = await Friend.findOne({});
    expect(friendship).toBeTruthy();
  });
});


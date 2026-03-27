jest.mock("../../src/models/FriendRequest");
jest.mock("../../src/models/Friend");
jest.mock("../../src/models/User");

const FriendRequest = require("../../src/models/FriendRequest");
const Friend = require("../../src/models/Friend");
const User = require("../../src/models/User");
const friendRequestService = require("../../src/services/friendRequest.service");

describe("friendRequest.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("send", () => {
    it("should return 400 when sending request to self", async () => {
      const result = await friendRequestService.send("u1", { toUserId: "u1" });
      expect(result.error).toEqual({ status: 400, message: "Invalid user" });
    });

    it("should return 404 when target user does not exist", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const result = await friendRequestService.send("u1", { toUserId: "u2" });
      expect(result.error).toEqual({ status: 404, message: "User not found" });
    });

    it("should create friend request when valid", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "u2", status: "active" }),
      });
      Friend.findOne.mockResolvedValue(null);
      FriendRequest.findOne.mockResolvedValue(null);
      FriendRequest.create.mockResolvedValue({ _id: "r1" });
      FriendRequest.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({ _id: "r1", fromUser: { _id: "u1" }, toUser: { _id: "u2" } }),
        }),
      });

      const result = await friendRequestService.send("u1", { toUserId: "u2" });

      expect(FriendRequest.create).toHaveBeenCalledWith({ fromUser: "u1", toUser: "u2" });
      expect(result.data).toBeDefined();
      expect(result.data._id).toBe("r1");
    });
  });

  describe("availableUsers", () => {
    it("should exclude me, friends, and pending users", async () => {
      Friend.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ user1: "u1", user2: "u2" }]),
        }),
      });
      FriendRequest.find
        .mockReturnValueOnce({ distinct: jest.fn().mockResolvedValue(["u3"]) })
        .mockReturnValueOnce({ distinct: jest.fn().mockResolvedValue(["u4"]) });

      const lean = jest.fn().mockResolvedValue([{ _id: "u5", name: "User 5" }]);
      const limit = jest.fn().mockReturnValue({ lean });
      const populateRole = jest.fn().mockReturnValue({ limit });
      const populateLevel = jest.fn().mockReturnValue({ populate: populateRole });
      const populateClass = jest.fn().mockReturnValue({ populate: populateLevel });
      const populateCampus = jest.fn().mockReturnValue({ populate: populateClass });
      const select = jest.fn().mockReturnValue({ populate: populateCampus });
      User.find.mockReturnValue({ select });

      const result = await friendRequestService.availableUsers("u1");

      expect(User.find).toHaveBeenCalledWith({
        _id: { $nin: ["u1", "u2", "u3", "u4"] },
        status: "active",
      });
      expect(result.data).toEqual([{ _id: "u5", name: "User 5" }]);
    });
  });
});


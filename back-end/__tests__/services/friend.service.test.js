jest.mock("../../src/models/Friend");
jest.mock("../../src/models/FriendRequest");
jest.mock("../../src/models/User");

const Friend = require("../../src/models/Friend");
const FriendRequest = require("../../src/models/FriendRequest");
const User = require("../../src/models/User");
const friendService = require("../../src/services/friend.service");

describe("friend.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("areFriends", () => {
    it("should return true when friendship exists", async () => {
      Friend.findOne.mockResolvedValue({ _id: "f1" });
      const result = await friendService.areFriends("u1", "u2");
      expect(result).toBe(true);
    });

    it("should return false when friendship does not exist", async () => {
      Friend.findOne.mockResolvedValue(null);
      const result = await friendService.areFriends("u1", "u2");
      expect(result).toBe(false);
    });
  });

  describe("add", () => {
    it("should return 400 when adding self", async () => {
      const result = await friendService.add("u1", { userId: "u1" });
      expect(result.error).toEqual({ status: 400, message: "Invalid userId" });
    });

    it("should return 404 when target user is not found", async () => {
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      const result = await friendService.add("u1", { userId: "u2" });
      expect(result.error).toEqual({ status: 404, message: "User not found" });
    });

    it("should create friend request when inputs are valid", async () => {
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

      const result = await friendService.add("u1", { userId: "u2" });

      expect(FriendRequest.create).toHaveBeenCalledWith({ fromUser: "u1", toUser: "u2" });
      expect(result.data).toBeDefined();
      expect(result.data._id).toBe("r1");
    });
  });

  describe("remove", () => {
    it("should return 404 when friendship is not found", async () => {
      Friend.findOneAndDelete.mockResolvedValue(null);
      const result = await friendService.remove("u1", "u2");
      expect(result.error).toEqual({ status: 404, message: "Friendship not found" });
    });

    it("should return user pair when friendship is removed", async () => {
      Friend.findOneAndDelete.mockResolvedValue({ _id: "f1" });
      const result = await friendService.remove("u1", "u2");
      expect(result.data).toEqual({ user1: "u1", user2: "u2" });
    });
  });
});


jest.mock("../../src/models/Post");
jest.mock("../../src/models/User");
jest.mock("../../src/models/Category");
jest.mock("../../src/models/SubCategory");
jest.mock("../../src/models/Comment");
jest.mock("../../src/models/Engagement");
jest.mock("../../src/models/Solution");
jest.mock("../../src/models/Notification");
jest.mock("../../src/models/WorkshopRequest");
jest.mock("../../src/services/notification.service", () => ({
  notifyPostDeleted: jest.fn().mockResolvedValue(undefined),
  notifyPostSolved: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../src/services/friend.service", () => ({
  areFriends: jest.fn().mockResolvedValue(false),
  getMyFriendIds: jest.fn().mockResolvedValue([]),
}));
jest.mock("../../src/utils/contextUtils", () => ({
  haveSameClassContext: jest.fn().mockReturnValue(false),
}));

const Post = require("../../src/models/Post");
const User = require("../../src/models/User");
const Category = require("../../src/models/Category");
const SubCategory = require("../../src/models/SubCategory");
const postService = require("../../src/services/post.service");

function mockFindByIdLean(mockValue) {
  const lean = jest.fn().mockResolvedValue(mockValue);
  const select = jest.fn().mockReturnValue({ lean });
  User.findById.mockReturnValue({ select });
  return { select, lean };
}

describe("post.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createPost", () => {
    it("should return 403 when current user is not active", async () => {
      mockFindByIdLean({ status: "pending" });

      const result = await postService.createPost("user-1", { content: "hello", category: "General" }, []);

      expect(result.error).toEqual({
        status: 403,
        message: "Seuls les comptes activés peuvent créer des posts.",
      });
      expect(Category.findOne).not.toHaveBeenCalled();
      expect(Post.create).not.toHaveBeenCalled();
    });

    it("should return 400 when category does not exist", async () => {
      mockFindByIdLean({ status: "active" });
      Category.findOne.mockResolvedValue(null);

      const result = await postService.createPost("user-1", { content: "hello", category: "Unknown" }, []);

      expect(Category.findOne).toHaveBeenCalledWith({ name: "Unknown" });
      expect(result.error).toEqual({ status: 400, message: "Category not found" });
      expect(Post.create).not.toHaveBeenCalled();
    });

    it("should create a post successfully with normalized type", async () => {
      mockFindByIdLean({ status: "active" });
      Category.findOne.mockResolvedValue({ _id: "cat-1" });
      SubCategory.findOne.mockResolvedValue({ _id: "sub-1" });
      Post.create.mockResolvedValue({ _id: "post-1", content: "test" });

      const result = await postService.createPost(
        "user-1",
        { content: "test", category: "General", subCategory: "JS", type: "knowledge" },
        [{ url: "/uploads/images/a.png", type: "image" }]
      );

      expect(Post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "knowledge",
          content: "test",
          author: "user-1",
          category: "cat-1",
          subCategory: "sub-1",
          media: [{ url: "/uploads/images/a.png", type: "image" }],
        })
      );
      expect(result.data).toEqual({ _id: "post-1", content: "test" });
    });
  });
});


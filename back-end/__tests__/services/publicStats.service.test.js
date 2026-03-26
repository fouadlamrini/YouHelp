jest.mock("../../src/models/User");
jest.mock("../../src/models/Role");
jest.mock("../../src/models/Post");

const User = require("../../src/models/User");
const Role = require("../../src/models/Role");
const Post = require("../../src/models/Post");
const publicStatsService = require("../../src/services/publicStats.service");

describe("publicStats.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return activeStudents, solvedPosts, totalFormateurs when both roles exist", async () => {
    Role.findOne.mockImplementation((query) => {
      if (query.name === "etudiant") return Promise.resolve({ _id: "etudiant-role-id" });
      if (query.name === "formateur") return Promise.resolve({ _id: "formateur-role-id" });
      return Promise.resolve(null);
    });

    User.countDocuments.mockResolvedValueOnce(12).mockResolvedValueOnce(5);
    Post.countDocuments.mockResolvedValue(8);

    const result = await publicStatsService.getPublicStats();

    expect(result.data).toEqual({
      activeStudents: 12,
      solvedPosts: 8,
      totalFormateurs: 5,
    });
    expect(User.countDocuments).toHaveBeenCalledTimes(2);
    expect(User.countDocuments).toHaveBeenNthCalledWith(1, {
      status: "active",
      role: "etudiant-role-id",
    });
    expect(Post.countDocuments).toHaveBeenCalledWith({ isSolved: true });
    expect(User.countDocuments).toHaveBeenNthCalledWith(2, { role: "formateur-role-id" });
  });

  it("should omit role from active student query when etudiant role is missing", async () => {
    Role.findOne.mockImplementation((query) => {
      if (query.name === "etudiant") return Promise.resolve(null);
      if (query.name === "formateur") return Promise.resolve({ _id: "formateur-role-id" });
      return Promise.resolve(null);
    });

    User.countDocuments.mockResolvedValueOnce(3).mockResolvedValueOnce(2);
    Post.countDocuments.mockResolvedValue(0);

    const result = await publicStatsService.getPublicStats();

    expect(result.data.activeStudents).toBe(3);
    expect(User.countDocuments).toHaveBeenNthCalledWith(1, { status: "active" });
  });

  it("should set totalFormateurs to 0 when formateur role is missing", async () => {
    Role.findOne.mockImplementation((query) => {
      if (query.name === "etudiant") return Promise.resolve({ _id: "etudiant-role-id" });
      if (query.name === "formateur") return Promise.resolve(null);
      return Promise.resolve(null);
    });

    User.countDocuments.mockResolvedValueOnce(4);
    Post.countDocuments.mockResolvedValue(1);

    const result = await publicStatsService.getPublicStats();

    expect(result.data.totalFormateurs).toBe(0);
    expect(User.countDocuments).toHaveBeenCalledTimes(1);
  });
});

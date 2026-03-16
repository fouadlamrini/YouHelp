const Level = require("../../src/models/Level");
const levelService = require("../../src/services/level.service");

jest.mock("../../src/models/Level");

describe("level.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return levels sorted when data exists", async () => {
      const levels = [
        { _id: "1", name: "Beginner" },
        { _id: "2", name: "Advanced" },
      ];

      const sortMock = jest.fn().mockResolvedValue(levels);
      Level.find.mockReturnValue({ sort: sortMock });

      const result = await levelService.getAll();

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(levels);
      expect(Level.find).toHaveBeenCalledTimes(1);
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it("should return error 404 when no levels found", async () => {
      const sortMock = jest.fn().mockResolvedValue([]);
      Level.find.mockReturnValue({ sort: sortMock });

      const result = await levelService.getAll();

      expect(result.error).toEqual({
        status: 404,
        message: "No levels found",
      });
    });
  });

  describe("getById", () => {
    it("should return level when found", async () => {
      const level = { _id: "1", name: "Beginner" };
      Level.findById.mockResolvedValue(level);

      const result = await levelService.getById("1");

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(level);
      expect(Level.findById).toHaveBeenCalledWith("1");
    });

    it("should return 404 error when level not found", async () => {
      Level.findById.mockResolvedValue(null);

      const result = await levelService.getById("missing");

      expect(result.error).toEqual({
        status: 404,
        message: "Level not found",
      });
    });
  });

  describe("create", () => {
    it("should create level when name is unique", async () => {
      const body = { name: "  Beginner  " };
      const created = { _id: "1", name: "Beginner" };

      Level.findOne.mockResolvedValue(null);
      Level.create.mockResolvedValue(created);

      const result = await levelService.create(body);

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(created);
      expect(Level.findOne).toHaveBeenCalledWith({ name: "Beginner" });
      expect(Level.create).toHaveBeenCalledWith({ name: "Beginner" });
    });

    it("should return 400 error when level already exists", async () => {
      const existing = { _id: "1", name: "Beginner" };
      Level.findOne.mockResolvedValue(existing);

      const result = await levelService.create({ name: "Beginner" });

      expect(result.error).toEqual({
        status: 400,
        message: "Level already exists",
      });
      expect(Level.create).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update level when found", async () => {
      const updated = { _id: "1", name: "Intermediate" };
      Level.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await levelService.update("1", { name: "  Intermediate  " });

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(updated);
      expect(Level.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        { name: "Intermediate" },
        { new: true, runValidators: true }
      );
    });

    it("should return 404 error when level to update is not found", async () => {
      Level.findByIdAndUpdate.mockResolvedValue(null);

      const result = await levelService.update("missing", { name: "Intermediate" });

      expect(result.error).toEqual({
        status: 404,
        message: "Level not found",
      });
    });
  });

  describe("deleteLevel", () => {
    it("should return ok true when level is deleted", async () => {
      Level.findByIdAndDelete.mockResolvedValue({ _id: "1" });

      const result = await levelService.deleteLevel("1");

      expect(result.error).toBeUndefined();
      expect(result.ok).toBe(true);
      expect(Level.findByIdAndDelete).toHaveBeenCalledWith("1");
    });

    it("should return 404 error when level to delete is not found", async () => {
      Level.findByIdAndDelete.mockResolvedValue(null);

      const result = await levelService.deleteLevel("missing");

      expect(result.error).toEqual({
        status: 404,
        message: "Level not found",
      });
    });
  });
});


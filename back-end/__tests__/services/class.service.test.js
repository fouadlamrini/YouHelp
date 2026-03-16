const Class = require("../../src/models/Class");
const Campus = require("../../src/models/Campus");
const classService = require("../../src/services/class.service");

jest.mock("../../src/models/Class");
jest.mock("../../src/models/Campus");

describe("class.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return classes sorted when data exists", async () => {
      const classes = [
        { _id: "1", name: "Class A", campus: { _id: "c1", name: "YouCode Safi" } },
        { _id: "2", name: "Class B", campus: { _id: "c2", name: "YouCode Youssoufia" } },
      ];

      const sortMock = jest.fn().mockResolvedValue(classes);
      const populateMock = jest.fn(() => ({ sort: sortMock }));
      Class.find.mockReturnValue({ populate: populateMock });

      const result = await classService.getAll();

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(classes);
      expect(Class.find).toHaveBeenCalledTimes(1);
      expect(populateMock).toHaveBeenCalledWith("campus", "name");
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it("should return error 404 when no classes found", async () => {
      const sortMock = jest.fn().mockResolvedValue([]);
      const populateMock = jest.fn(() => ({ sort: sortMock }));
      Class.find.mockReturnValue({ populate: populateMock });

      const result = await classService.getAll();

      expect(result.error).toEqual({
        status: 404,
        message: "No classes found",
      });
    });
  });

  describe("getById", () => {
    it("should return class when found", async () => {
      const cls = { _id: "1", name: "Class A", campus: { _id: "c1", name: "YouCode Safi" } };

      const populateMock = jest.fn().mockResolvedValue(cls);
      Class.findById.mockReturnValue({ populate: populateMock });

      const result = await classService.getById("1");

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(cls);
      expect(Class.findById).toHaveBeenCalledWith("1");
      expect(populateMock).toHaveBeenCalledWith("campus", "name");
    });

    it("should return 404 error when class not found", async () => {
      const populateMock = jest.fn().mockResolvedValue(null);
      Class.findById.mockReturnValue({ populate: populateMock });

      const result = await classService.getById("missing");

      expect(result.error).toEqual({
        status: 404,
        message: "Class not found",
      });
    });
  });

  describe("create", () => {
    it("should create class without campus when campus not provided", async () => {
      const body = { name: "  Class A  ", nickName: "  A1  ", year: "2024" };
      const created = {
        _id: "1",
        name: "Class A",
        nickName: "A1",
        year: 2024,
        campus: null,
        populate: jest.fn().mockResolvedValue(),
      };

      Class.create.mockResolvedValue(created);

      const result = await classService.create(body);

      expect(result.error).toBeUndefined();
      expect(Class.create).toHaveBeenCalledWith({
        name: "Class A",
        nickName: "A1",
        year: 2024,
        campus: null,
      });
      expect(created.populate).toHaveBeenCalledWith("campus", "name");
      expect(result.data).toBe(created);
    });

    it("should create class with campus when campus exists", async () => {
      const body = { name: "Class B", campus: "campusId" };
      const campusDoc = { _id: "campusId" };
      const created = {
        _id: "2",
        name: "Class B",
        campus: campusDoc._id,
        populate: jest.fn().mockResolvedValue(),
      };

      Campus.findById.mockResolvedValue(campusDoc);
      Class.create.mockResolvedValue(created);

      const result = await classService.create(body);

      expect(result.error).toBeUndefined();
      expect(Campus.findById).toHaveBeenCalledWith("campusId");
      expect(Class.create).toHaveBeenCalledWith({
        name: "Class B",
        nickName: undefined,
        year: undefined,
        campus: campusDoc._id,
      });
      expect(created.populate).toHaveBeenCalledWith("campus", "name");
      expect(result.data).toBe(created);
    });

    it("should return 400 error when campus does not exist", async () => {
      Campus.findById.mockResolvedValue(null);

      const result = await classService.create({
        name: "Class C",
        campus: "invalidCampus",
      });

      expect(result.error).toEqual({
        status: 400,
        message: "Campus not found",
      });
      expect(Class.create).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update class when found and campus unchanged", async () => {
      const updated = {
        _id: "1",
        name: "Updated Class",
        nickName: "UC",
        year: 2025,
        campus: { _id: "campusId", name: "YouCode Safi" },
      };

      const populateMock = jest.fn().mockResolvedValue(updated);
      Class.findByIdAndUpdate.mockReturnValue({ populate: populateMock });

      const result = await classService.update("1", {
        name: "  Updated Class  ",
        nickName: "  UC  ",
        year: "2025",
      });

      expect(result.error).toBeUndefined();
      expect(Class.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        {
          name: "Updated Class",
          nickName: "UC",
          year: 2025,
        },
        { new: true, runValidators: true }
      );
      expect(populateMock).toHaveBeenCalledWith("campus", "name");
      expect(result.data).toEqual(updated);
    });

    it("should clear campus when campus is empty string", async () => {
      const updated = {
        _id: "1",
        name: "Class A",
        nickName: null,
        year: null,
        campus: null,
      };

      const populateMock = jest.fn().mockResolvedValue(updated);
      Class.findByIdAndUpdate.mockReturnValue({ populate: populateMock });

      const result = await classService.update("1", {
        name: "Class A",
        nickName: "",
        year: "",
        campus: "",
      });

      expect(result.error).toBeUndefined();
      expect(Class.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        {
          name: "Class A",
          nickName: null,
          year: null,
          campus: null,
        },
        { new: true, runValidators: true }
      );
      expect(result.data).toEqual(updated);
    });

    it("should return 400 error when new campus does not exist", async () => {
      Campus.findById.mockResolvedValue(null);

      const result = await classService.update("1", {
        campus: "invalidCampus",
      });

      expect(result.error).toEqual({
        status: 400,
        message: "Campus not found",
      });
      expect(Class.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should return 404 error when class not found", async () => {
      const populateMock = jest.fn().mockResolvedValue(null);
      Class.findByIdAndUpdate.mockReturnValue({ populate: populateMock });

      const result = await classService.update("missing", {
        name: "Does not matter",
      });

      expect(result.error).toEqual({
        status: 404,
        message: "Class not found",
      });
    });
  });

  describe("deleteClass", () => {
    it("should return ok true when class is deleted", async () => {
      Class.findByIdAndDelete.mockResolvedValue({ _id: "1" });

      const result = await classService.deleteClass("1");

      expect(result.error).toBeUndefined();
      expect(result.ok).toBe(true);
      expect(Class.findByIdAndDelete).toHaveBeenCalledWith("1");
    });

    it("should return 404 error when class to delete is not found", async () => {
      Class.findByIdAndDelete.mockResolvedValue(null);

      const result = await classService.deleteClass("missing");

      expect(result.error).toEqual({
        status: 404,
        message: "Class not found",
      });
    });
  });
});


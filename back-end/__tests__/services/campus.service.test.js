const Campus = require("../../src/models/Campus");
const campusService = require("../../src/services/campus.service");

jest.mock("../../src/models/Campus");

describe("campus.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return campuses sorted when data exists", async () => {
      const campuses = [{ _id: "1", name: "A" }, { _id: "2", name: "B" }];
      Campus.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(campuses),
      });

      const result = await campusService.getAll();

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(campuses);
      expect(Campus.find).toHaveBeenCalledTimes(1);
    });

    it("should return error 404 when no campuses found", async () => {
      Campus.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const result = await campusService.getAll();

      expect(result.error).toEqual({
        status: 404,
        message: "No campuses found",
      });
    });
  });

  describe("getById", () => {
    it("should return campus when found", async () => {
      const campus = { _id: "1", name: "YouCode" };
      Campus.findById.mockResolvedValue(campus);

      const result = await campusService.getById("1");

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(campus);
    });

    it("should return 404 error when campus not found", async () => {
      Campus.findById.mockResolvedValue(null);

      const result = await campusService.getById("missing");

      expect(result.error).toEqual({
        status: 404,
        message: "Campus not found",
      });
    });
  });

  describe("create", () => {
    it("should create campus when name is unique", async () => {
      const body = { name: "YouCode Safi" };
      const created = { _id: "1", name: "YouCode Safi" };

      Campus.findOne.mockResolvedValue(null);
      Campus.create.mockResolvedValue(created);

      const result = await campusService.create(body);

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(created);
      expect(Campus.create).toHaveBeenCalledWith({ name: "YouCode Safi" });
    });

    it("should return 400 error when campus already exists", async () => {
      const existing = { _id: "1", name: "YouCode Safi" };
      Campus.findOne.mockResolvedValue(existing);

      const result = await campusService.create({ name: "YouCode Safi" });

      expect(result.error).toEqual({
        status: 400,
        message: "Campus already exists",
      });
      expect(Campus.create).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update campus when found", async () => {
      const updated = { _id: "1", name: "Updated Campus" };
      Campus.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await campusService.update("1", { name: "Updated Campus" });

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(updated);
      expect(Campus.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        { name: "Updated Campus" },
        { new: true, runValidators: true }
      );
    });

    it("should return 404 error when campus to update is not found", async () => {
      Campus.findByIdAndUpdate.mockResolvedValue(null);

      const result = await campusService.update("missing", { name: "X" });

      expect(result.error).toEqual({
        status: 404,
        message: "Campus not found",
      });
    });
  });

  describe("deleteCampus", () => {
    it("should return ok true when campus is deleted", async () => {
      Campus.findByIdAndDelete.mockResolvedValue({ _id: "1" });

      const result = await campusService.deleteCampus("1");

      expect(result.error).toBeUndefined();
      expect(result.ok).toBe(true);
      expect(Campus.findByIdAndDelete).toHaveBeenCalledWith("1");
    });

    it("should return 404 error when campus to delete is not found", async () => {
      Campus.findByIdAndDelete.mockResolvedValue(null);

      const result = await campusService.deleteCampus("missing");

      expect(result.error).toEqual({
        status: 404,
        message: "Campus not found",
      });
    });
  });
});


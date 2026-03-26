jest.mock("../../src/models/Category");

const Category = require("../../src/models/Category");
const categoryService = require("../../src/services/category.service");

describe("category.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return categories sorted by createdAt desc", async () => {
      const rows = [{ name: "A" }, { name: "B" }];
      const sort = jest.fn().mockResolvedValue(rows);
      Category.find.mockReturnValue({ sort });

      const result = await categoryService.getAll();

      expect(Category.find).toHaveBeenCalledWith();
      expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual({ data: rows });
    });
  });

  describe("create", () => {
    it("should return 400 when category name already exists", async () => {
      Category.findOne.mockResolvedValue({ _id: "cat-1", name: "General" });

      const result = await categoryService.create({ name: "General" });

      expect(result.error).toEqual({
        status: 400,
        message: "Une catégorie avec ce nom existe déjà.",
      });
      expect(Category.create).not.toHaveBeenCalled();
    });

    it("should create category when name is unique", async () => {
      Category.findOne.mockResolvedValue(null);
      Category.create.mockResolvedValue({
        _id: "cat-1",
        name: "General",
        icon: "book",
        color: "#4f46e5",
      });

      const result = await categoryService.create({
        name: "General",
        icon: "book",
        color: "#4f46e5",
      });

      expect(Category.create).toHaveBeenCalledWith({
        name: "General",
        icon: "book",
        color: "#4f46e5",
      });
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe("General");
    });
  });
});


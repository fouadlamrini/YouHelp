jest.mock("../../src/models/SubCategory");
jest.mock("../../src/models/Category");

const SubCategory = require("../../src/models/SubCategory");
const Category = require("../../src/models/Category");
const subcategoryService = require("../../src/services/subcategory.service");

function mockFindChain(rows) {
  return {
    populate: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(rows),
    }),
  };
}

describe("subcategory.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return subcategories populated with category name and sorted by createdAt desc", async () => {
      const rows = [{ name: "JS", category: { name: "General" } }];
      SubCategory.find.mockReturnValue(mockFindChain(rows));

      const result = await subcategoryService.getAll();

      expect(SubCategory.find).toHaveBeenCalledWith();
      expect(result).toEqual({ data: rows });
    });
  });

  describe("getByCategory", () => {
    it("should return 400 when categoryId is missing", async () => {
      const result = await subcategoryService.getByCategory(undefined);
      expect(result.error).toEqual({ status: 400, message: "categoryId is required" });
    });

    it("should return subcategories for category populated with category name and sorted by createdAt desc", async () => {
      const categoryId = "cat-1";
      const rows = [{ name: "Node", category: { name: "Tech" } }];
      SubCategory.find.mockReturnValue(mockFindChain(rows));

      const result = await subcategoryService.getByCategory(categoryId);

      expect(SubCategory.find).toHaveBeenCalledWith({ category: categoryId });
      expect(result).toEqual({ data: rows });
    });
  });

  describe("create", () => {
    it("should return 400 when parent category does not exist", async () => {
      Category.findOne.mockResolvedValue(null);

      const result = await subcategoryService.create({ name: " JS ", category: "Unknown" });

      expect(Category.findOne).toHaveBeenCalledWith({ name: "Unknown" });
      expect(result.error).toEqual({ status: 400, message: "Catégorie parente introuvable." });
      expect(SubCategory.create).not.toHaveBeenCalled();
    });

    it("should create a subcategory with trimmed name", async () => {
      Category.findOne.mockResolvedValue({ _id: "cat-1" });
      SubCategory.create.mockResolvedValue({ _id: "sub-1", name: "JS", category: "cat-1" });

      const result = await subcategoryService.create({ name: " JS ", category: "General" });

      expect(SubCategory.create).toHaveBeenCalledWith({ name: "JS", category: "cat-1" });
      expect(result.data).toEqual({ _id: "sub-1", name: "JS", category: "cat-1" });
    });

    it("should return 400 on duplicate subcategory in same category (err.code === 11000)", async () => {
      Category.findOne.mockResolvedValue({ _id: "cat-1" });
      SubCategory.create.mockRejectedValue({ code: 11000 });

      const result = await subcategoryService.create({ name: "JS", category: "General" });

      expect(result.error).toEqual({
        status: 400,
        message: "Cette sous-catégorie existe déjà dans cette catégorie.",
      });
    });
  });

  describe("update", () => {
    it("should return 400 when parent category does not exist", async () => {
      Category.findOne.mockResolvedValue(null);

      const result = await subcategoryService.update("sub-1", { name: "Updated", category: "Unknown" });

      expect(result.error).toEqual({ status: 400, message: "Category not found" });
      expect(SubCategory.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should update and return updated subcategory", async () => {
      Category.findOne.mockResolvedValue({ _id: "cat-2" });
      SubCategory.findByIdAndUpdate.mockResolvedValue({ _id: "sub-1", name: "Updated", category: "cat-2" });

      const result = await subcategoryService.update("sub-1", { name: "Updated", category: "NewCat" });

      expect(SubCategory.findByIdAndUpdate).toHaveBeenCalledWith(
        "sub-1",
        { name: "Updated", category: "cat-2" },
        { new: true, runValidators: true }
      );
      expect(result.data).toEqual({ _id: "sub-1", name: "Updated", category: "cat-2" });
    });

    it("should return 404 when subcategory is not found", async () => {
      Category.findOne.mockResolvedValue({ _id: "cat-2" });
      SubCategory.findByIdAndUpdate.mockResolvedValue(null);

      const result = await subcategoryService.update("sub-404", { name: "Updated", category: "NewCat" });

      expect(result.error).toEqual({ status: 404, message: "SubCategory not found" });
    });

    it("should return 400 on duplicate update (err.code === 11000)", async () => {
      Category.findOne.mockResolvedValue({ _id: "cat-2" });
      SubCategory.findByIdAndUpdate.mockRejectedValue({ code: 11000 });

      const result = await subcategoryService.update("sub-1", { name: "JS", category: "NewCat" });

      expect(result.error).toEqual({
        status: 400,
        message: "SubCategory already exists in this category",
      });
    });
  });

  describe("deleteSubCategory", () => {
    it("should return 404 when deleting a non-existing subcategory", async () => {
      SubCategory.findByIdAndDelete.mockResolvedValue(null);

      const result = await subcategoryService.deleteSubCategory("sub-404");

      expect(result.error).toEqual({ status: 404, message: "SubCategory not found" });
    });

    it("should return ok true when subcategory is deleted", async () => {
      SubCategory.findByIdAndDelete.mockResolvedValue({ _id: "sub-1" });

      const result = await subcategoryService.deleteSubCategory("sub-1");

      expect(result.ok).toBe(true);
    });
  });
});

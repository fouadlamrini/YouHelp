jest.mock("../../src/models/Favorite");
jest.mock("../../src/models/Post");

const Favorite = require("../../src/models/Favorite");
const Post = require("../../src/models/Post");

const favoriteService = require("../../src/services/favorite.service");

function mockFindByIdChain(mockValue) {
  const select = jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(mockValue),
  });
  Post.findById.mockReturnValue({ select });
}

describe("favorite.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addToFavorites", () => {
    it("should return 404 when post is not found (contentType=post)", async () => {
      mockFindByIdChain(null);
      const result = await favoriteService.addToFavorites("user-1", {
        contentType: "post",
        contentId: "post-1",
      });

      expect(result.error).toEqual({
        status: 404,
        message: "Post non trouvé",
      });
      expect(Favorite.findOne).not.toHaveBeenCalled();
      expect(Favorite.create).not.toHaveBeenCalled();
    });

    it("should return 404 when post is not found (contentType=knowledge)", async () => {
      mockFindByIdChain(null);
      const result = await favoriteService.addToFavorites("user-1", {
        contentType: "knowledge",
        contentId: "post-1",
      });

      expect(result.error).toEqual({
        status: 404,
        message: "Connaissance non trouvée",
      });
      expect(Favorite.findOne).not.toHaveBeenCalled();
      expect(Favorite.create).not.toHaveBeenCalled();
    });

    it("should return 400 when the favorite already exists (pre-check)", async () => {
      mockFindByIdChain({ type: "post" });
      Favorite.findOne.mockResolvedValue({ _id: "fav-1" });

      const result = await favoriteService.addToFavorites("user-1", {
        contentType: "post",
        contentId: "post-1",
      });

      expect(result.error).toEqual({
        status: 400,
        message: "Ce contenu est déjà dans vos favoris",
      });
      expect(Favorite.create).not.toHaveBeenCalled();
    });

    it("should return 400 on duplicate key error (err.code === 11000)", async () => {
      mockFindByIdChain({ type: "post" });
      Favorite.findOne.mockResolvedValue(null);
      Favorite.create.mockRejectedValue({ code: 11000 });

      const result = await favoriteService.addToFavorites("user-1", {
        contentType: "post",
        contentId: "post-1",
      });

      expect(result.error).toEqual({
        status: 400,
        message: "Ce contenu est déjà dans vos favoris",
      });
    });
  });

  describe("checkIfFavorite", () => {
    it("should return 400 for invalid contentType", async () => {
      const result = await favoriteService.checkIfFavorite("user-1", "invalid", "id-1");
      expect(result.error).toEqual({
        status: 400,
        message: "Type de contenu invalide. Utilisez 'post' ou 'knowledge'",
      });
    });

    it("should return isFavorite=false when favorite does not exist", async () => {
      Favorite.findOne.mockResolvedValue(null);

      const result = await favoriteService.checkIfFavorite("user-1", "post", "post-1");

      expect(result.data).toEqual({ isFavorite: false });
      expect(typeof result.data.isFavorite).toBe("boolean");
    });

    it("should return isFavorite=true when favorite exists", async () => {
      Favorite.findOne.mockResolvedValue({ _id: "fav-1" });

      const result = await favoriteService.checkIfFavorite("user-1", "post", "post-1");

      expect(result.data).toEqual({ isFavorite: true });
      expect(typeof result.data.isFavorite).toBe("boolean");
    });
  });
});


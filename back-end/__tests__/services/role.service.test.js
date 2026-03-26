jest.mock("../../src/models/Role");

const Role = require("../../src/models/Role");
const roleService = require("../../src/services/role.service");

describe("role.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return roles sorted by name", async () => {
      const roles = [{ name: "admin" }, { name: "etudiant" }, { name: "formateur" }];
      const sort = jest.fn().mockResolvedValue(roles);
      Role.find.mockReturnValue({ sort });

      const result = await roleService.getAll();

      expect(Role.find).toHaveBeenCalledWith();
      expect(sort).toHaveBeenCalledWith({ name: 1 });
      expect(result).toEqual({ data: roles });
    });
  });
});

jest.mock("jsonwebtoken", () => ({ sign: jest.fn() }));
jest.mock("../../src/models/User");
jest.mock("../../src/models/Role");
jest.mock("../../src/models/Campus");
jest.mock("../../src/models/Class");
jest.mock("../../src/models/Level");
jest.mock("../../src/services/notification.service", () => ({
  notifyNewRegistration: jest.fn().mockResolvedValue(undefined),
}));

const jwt = require("jsonwebtoken");
const User = require("../../src/models/User");
const Role = require("../../src/models/Role");

const authService = require("../../src/services/auth.service");

describe("auth.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should create first user as super_admin with status active and completeProfile true", async () => {
      const superAdminRole = { _id: "role-super", name: "super_admin" };
      const createdUser = {
        _id: "user1",
        name: "Admin",
        email: "admin@test.com",
        status: "active",
        completeProfile: true,
      };

      User.findOne.mockResolvedValue(null);
      User.countDocuments.mockResolvedValue(0);
      Role.findOne.mockImplementation((q) =>
        Promise.resolve(q.name === "super_admin" ? superAdminRole : null)
      );
      User.create.mockResolvedValue(createdUser);
      jwt.sign.mockReturnValue("fake-token");

      const result = await authService.register({
        name: "Admin",
        email: "admin@test.com",
        password: "password123",
      });

      expect(result.error).toBeUndefined();
      expect(result.user).toEqual(createdUser);
      expect(result.roleName).toBe("super_admin");
      expect(result.token).toBe("fake-token");
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Admin",
          email: "admin@test.com",
          status: "active",
          completeProfile: true,
        })
      );
    });

    it("should create subsequent users as etudiant with status pending", async () => {
      const etudiantRole = { _id: "role-etu", name: "etudiant" };
      const createdUser = {
        _id: "user2",
        name: "Student",
        email: "student@test.com",
        status: "pending",
        completeProfile: false,
      };

      User.findOne.mockResolvedValue(null);
      User.countDocuments.mockResolvedValue(1);
      Role.findOne.mockImplementation((q) =>
        Promise.resolve(q.name === "etudiant" ? etudiantRole : null)
      );
      User.create.mockResolvedValue(createdUser);
      jwt.sign.mockReturnValue("token-etu");

      const result = await authService.register({
        name: "Student",
        email: "student@test.com",
        password: "pass456",
      });

      expect(result.error).toBeUndefined();
      expect(result.roleName).toBe("etudiant");
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "pending",
          completeProfile: false,
        })
      );
    });

    it("should return 400 when email already in use", async () => {
      User.findOne.mockResolvedValue({ _id: "existing" });

      const result = await authService.register({
        name: "Someone",
        email: "used@test.com",
        password: "pass",
      });

      expect(result.error).toEqual({ status: 400, message: "Email already in use" });
      expect(User.create).not.toHaveBeenCalled();
    });

    it("should return 500 when super_admin role not found for first user", async () => {
      User.findOne.mockResolvedValue(null);
      User.countDocuments.mockResolvedValue(0);
      Role.findOne.mockResolvedValue(null);

      const result = await authService.register({
        name: "First",
        email: "first@test.com",
        password: "pass",
      });

      expect(result.error).toEqual({
        status: 500,
        message: "super_admin role not found",
      });
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should return user and token on valid credentials", async () => {
      const user = {
        _id: "u1",
        name: "Test",
        email: "test@test.com",
        role: "roleId",
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(user);
      Role.findById.mockResolvedValue({ name: "etudiant" });
      jwt.sign.mockReturnValue("login-token");

      const result = await authService.login({
        email: "test@test.com",
        password: "correct",
      });

      expect(result.error).toBeUndefined();
      expect(result.user).toBe(user);
      expect(result.roleName).toBe("etudiant");
      expect(result.token).toBe("login-token");
      expect(user.comparePassword).toHaveBeenCalledWith("correct");
    });

    it("should return 400 when email does not exist", async () => {
      User.findOne.mockResolvedValue(null);

      const result = await authService.login({
        email: "nonexistent@test.com",
        password: "any",
      });

      expect(result.error).toEqual({
        status: 400,
        message: "Invalid credentials",
      });
    });

    it("should return 400 when password is incorrect", async () => {
      const user = {
        _id: "u1",
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockResolvedValue(user);

      const result = await authService.login({
        email: "test@test.com",
        password: "wrong",
      });

      expect(result.error).toEqual({
        status: 400,
        message: "Invalid credentials",
      });
    });
  });

  describe("changePassword", () => {
    it("should update password on success", async () => {
      const user = {
        _id: "u1",
        password: "hashed",
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(undefined),
      };
      User.findById.mockResolvedValue(user);

      const result = await authService.changePassword("u1", {
        currentPassword: "old",
        newPassword: "new",
      });

      expect(result.error).toBeUndefined();
      expect(result.ok).toBe(true);
      expect(user.password).toBe("new");
      expect(user.save).toHaveBeenCalled();
    });

    it("should return 404 when user not found", async () => {
      User.findById.mockResolvedValue(null);

      const result = await authService.changePassword("nonexistent", {
        currentPassword: "old",
        newPassword: "new",
      });

      expect(result.error).toEqual({ status: 404, message: "User not found" });
    });

    it("should return 400 when user has no password (OAuth)", async () => {
      const user = { _id: "u1", password: null };
      User.findById.mockResolvedValue(user);

      const result = await authService.changePassword("u1", {
        currentPassword: "any",
        newPassword: "new",
      });

      expect(result.error).toEqual({
        status: 400,
        message: "Cannot change password for OAuth accounts",
      });
    });

    it("should return 400 when current password is incorrect", async () => {
      const user = {
        _id: "u1",
        password: "hashed",
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findById.mockResolvedValue(user);

      const result = await authService.changePassword("u1", {
        currentPassword: "wrong",
        newPassword: "new",
      });

      expect(result.error).toEqual({
        status: 400,
        message: "Current password is incorrect",
      });
    });
  });

  describe("extractTokenFromHeader", () => {
    it("should return token when header is Bearer <token>", () => {
      expect(authService.extractTokenFromHeader("Bearer abc123")).toBe("abc123");
    });

    it("should return null when no header", () => {
      expect(authService.extractTokenFromHeader(null)).toBeNull();
      expect(authService.extractTokenFromHeader(undefined)).toBeNull();
    });

    it("should return undefined when Bearer has no space before token (split yields no second part)", () => {
      expect(authService.extractTokenFromHeader("Bearerxyz")).toBeUndefined();
    });

    it("should return full string when not Bearer (fallback)", () => {
      expect(authService.extractTokenFromHeader("plain-token")).toBe("plain-token");
    });
  });

  describe("getRoleName", () => {
    it("should return role name from Role document", async () => {
      const user = { _id: "u1", role: "roleId" };
      Role.findById.mockResolvedValue({ name: "admin" });

      const name = await authService.getRoleName(user);
      expect(name).toBe("admin");
    });

    it("should return etudiant when user is null", async () => {
      const name = await authService.getRoleName(null);
      expect(name).toBe("etudiant");
    });

    it("should return etudiant when user has no role", async () => {
      const name = await authService.getRoleName({ _id: "u1", role: null });
      expect(name).toBe("etudiant");
    });
  });

  describe("formatUserForResponse", () => {
    it("should return formatted user object", () => {
      const user = {
        _id: "id1",
        name: "Foo",
        email: "foo@test.com",
        status: "active",
        profilePicture: "pic.jpg",
        completeProfile: true,
      };
      const out = authService.formatUserForResponse(user, "etudiant");
      expect(out).toEqual({
        id: "id1",
        name: "Foo",
        email: "foo@test.com",
        status: "active",
        role: "etudiant",
        profilePicture: "pic.jpg",
        completeProfile: true,
      });
    });
  });
});

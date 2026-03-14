jest.mock("jsonwebtoken");
jest.mock("../../src/utils/blacklist", () => new Set());

const jwt = require("jsonwebtoken");
const blacklistedTokens = require("../../src/utils/blacklist");
const authMiddleware = require("../../src/middlewares/auth.middleware");

describe("auth.middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    blacklistedTokens.clear();
    jest.clearAllMocks();
  });

  it("should return 401 Unauthorized when no Authorization header", () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when header does not start with Bearer ", () => {
    req.headers.authorization = "Basic xyz";

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 Token has been revoked when token is in blacklist", () => {
    const token = "revoked-token";
    req.headers.authorization = `Bearer ${token}`;
    blacklistedTokens.add(token);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token has been revoked" });
    expect(next).not.toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it("should return 401 Invalid token when jwt.verify throws", () => {
    req.headers.authorization = "Bearer invalid-token";
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid");
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next and set req.user when token is valid", () => {
    const token = "valid-token";
    const payload = { id: "userId1", role: "etudiant" };
    req.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockReturnValue(payload);

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

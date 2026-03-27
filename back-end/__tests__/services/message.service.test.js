jest.mock("../../src/models/Message");
jest.mock("../../src/models/User");
jest.mock("../../src/services/friend.service", () => ({
  areFriends: jest.fn(),
}));

const Message = require("../../src/models/Message");
const User = require("../../src/models/User");
const { areFriends } = require("../../src/services/friend.service");
const messageService = require("../../src/services/message.service");

describe("message.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("send", () => {
    it("rejects call-like payload without text/attachment", async () => {
      const result = await messageService.send("u1", {
        receiverId: "u2",
        type: "call",
        callPayload: { callKind: "voice", callStatus: "missed" },
      });
      expect(result.error).toEqual({ status: 400, message: "content or attachment required" });
    });

    it("creates a normal message without call fields", async () => {
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: "u2" }) });
      areFriends.mockResolvedValue(true);
      Message.create.mockResolvedValue({ _id: "m1" });
      Message.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({ _id: "m1", content: "hello" }),
        }),
      });

      const result = await messageService.send("u1", { receiverId: "u2", content: "hello", type: "call" });

      expect(result.data).toBeDefined();
      expect(Message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sender: "u1",
          receiver: "u2",
          content: "hello",
        })
      );
      const payload = Message.create.mock.calls[0][0];
      expect(payload.callPayload).toBeUndefined();
      expect(payload.isSystem).toBeUndefined();
      expect(payload.systemType).toBeUndefined();
    });
  });
});

import { cappedMessages, RadioChatItem } from "./radio-hooks";

describe("cappedItems", () => {
  const m1: RadioChatItem = {
    id: 1,
    type: "message",
    message: "1",
    from: "code",
  };
  const m2: RadioChatItem = {
    id: 2,
    type: "message",
    message: "2",
    from: "user",
  };
  const m3: RadioChatItem = {
    id: 3,
    type: "message",
    message: "3",
    from: "code",
  };
  const m4: RadioChatItem = {
    id: 4,
    type: "message",
    message: "4",
    from: "user",
  };
  const g1: RadioChatItem = {
    id: "g1",
    type: "groupChange",
    group: 1,
  };
  const notice: RadioChatItem = {
    id: "truncationNotice",
    type: "truncationNotice",
  };
  it("doesn't truncate pointlessly", () => {
    const items = [m1, m2, m3];
    expect(cappedMessages(items, 3)).toEqual(items);
  });
  it("truncates", () => {
    const items = [m1, m2, m3, m4];
    expect(cappedMessages(items, 3)).toEqual([notice, m2, m3, m4]);
  });
  it("puts notice in right place", () => {
    const items = [g1, m1, m2, m3, m4];
    expect(cappedMessages(items, 3)).toEqual([g1, notice, m2, m3, m4]);
  });
});

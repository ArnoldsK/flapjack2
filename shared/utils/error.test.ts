import { checkUnreachable } from "./error";

describe("checkUnreachable", () => {
  it("throws an Error when called", () => {
    expect(() => checkUnreachable(undefined as never)).toThrow(Error);
  });

  it("error message includes 'Unreachable value:' and the value", () => {
    expect(() => checkUnreachable(undefined as never)).toThrow(
      "Unreachable value: undefined",
    );
  });

  it("includes non-undefined value in error message", () => {
    expect(() => checkUnreachable("foo" as never)).toThrow(
      "Unreachable value: foo",
    );
  });
});

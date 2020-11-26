import qs from "qs";
import { extractPageOptions } from "./utils";

describe("extractPageOptions", () => {

  it("should correctly extract page and limit options when present", () => {
    const validQuery: qs.ParsedQs = {
      page: "1",
      limit: "10"
    };
    const { page, limit } = extractPageOptions(validQuery);
    expect(page).toEqual(1);
    expect(limit).toEqual(10);
  });

  it("should throw an error when page is missing", () => {
      const onlyLimit: qs.ParsedQs = {
          limit: "10"
      };
      expect(() => extractPageOptions(onlyLimit)).toThrowError(
        new Error("page needs to be a valid number")
      );
  });

  it("should throw an error when limit is missing", () => {
    const onlyPage: qs.ParsedQs = {
        page: "10"
    };
    expect(() => extractPageOptions(onlyPage)).toThrowError(
      new Error("limit needs to be a valid number")
    );
  });

  it("should throw an error when page is not a number", () => {
      const invalidPageNaN = {
          page: "page1",
          limit: "10"
      }
      expect(() => extractPageOptions(invalidPageNaN)).toThrowError(
          new Error("page needs to be a valid number")
      )
  });
});

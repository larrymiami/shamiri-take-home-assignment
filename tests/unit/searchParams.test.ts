import { parsePositiveInt, parseSessionStatusFilter } from "@/lib/searchParams";

describe("search param parsing", () => {
  describe("parsePositiveInt", () => {
    it("returns fallback for null, zero, negative, and non-numeric values", () => {
      expect(parsePositiveInt(null, 7)).toBe(7);
      expect(parsePositiveInt("0", 7)).toBe(7);
      expect(parsePositiveInt("-3", 7)).toBe(7);
      expect(parsePositiveInt("abc", 7)).toBe(7);
    });

    it("returns floored positive integers", () => {
      expect(parsePositiveInt("3", 1)).toBe(3);
      expect(parsePositiveInt("3.8", 1)).toBe(3);
    });
  });

  describe("parseSessionStatusFilter", () => {
    it("accepts valid status filters", () => {
      expect(parseSessionStatusFilter("ALL")).toBe("ALL");
      expect(parseSessionStatusFilter("PROCESSED")).toBe("PROCESSED");
      expect(parseSessionStatusFilter("SAFE")).toBe("SAFE");
      expect(parseSessionStatusFilter("RISK")).toBe("RISK");
      expect(parseSessionStatusFilter("FLAGGED_FOR_REVIEW")).toBe("FLAGGED_FOR_REVIEW");
    });

    it("falls back to ALL for unknown values", () => {
      expect(parseSessionStatusFilter(undefined)).toBe("ALL");
      expect(parseSessionStatusFilter(null)).toBe("ALL");
      expect(parseSessionStatusFilter("UNKNOWN")).toBe("ALL");
    });
  });
});

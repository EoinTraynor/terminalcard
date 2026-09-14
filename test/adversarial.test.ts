import { describe, it, expect } from "vitest";
import { renderCard, sanitizeText } from "../src/ui/card.js";
import { isSafeWebUrl } from "../src/ui/menu.js";
import { normalizeSocialLink } from "../src/init/normalize.js";

describe("Adversarial Robustness & Edge-Case Suite", () => {
  describe("1. Schema poisoning & Malformed JSON", () => {
    it("handles links as undefined or null without crashing", () => {
      const poisonedConfig: any = {
        name: "Crash Test",
        handle: "crasher",
        links: null,
      };
      expect(() => renderCard(poisonedConfig)).not.toThrow();
    });

    it("handles customLinks as non-array without crashing", () => {
      const poisonedConfig: any = {
        name: "Crash Test",
        handle: "crasher",
        links: {},
        customLinks: "not-an-array",
      };
      expect(() => renderCard(poisonedConfig)).not.toThrow();
    });

    it("handles theme as undefined or null without crashing", () => {
      const poisonedConfig: any = {
        name: "Crash Test",
        handle: "crasher",
        links: {},
        theme: null,
      };
      expect(() => renderCard(poisonedConfig)).not.toThrow();
    });

    it("handles customLinks containing null items", () => {
      const poisonedConfig: any = {
        name: "Crash Test",
        handle: "crasher",
        links: {},
        customLinks: [null, undefined, { label: "", url: "" }, { label: "Test", url: "https://test.com" }],
      };
      expect(() => renderCard(poisonedConfig)).not.toThrow();
    });
  });

  describe("2. URL Scheme Safety", () => {
    it("allows standard http and https URLs", () => {
      expect(isSafeWebUrl("https://github.com")).toBe(true);
      expect(isSafeWebUrl("http://example.com/blog")).toBe(true);
    });

    it("rejects dangerous protocol schemes", () => {
      expect(isSafeWebUrl("javascript:alert(1)")).toBe(false);
      expect(isSafeWebUrl("file:///etc/passwd")).toBe(false);
      expect(isSafeWebUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
      expect(isSafeWebUrl("calc.exe")).toBe(false);
      expect(isSafeWebUrl("")).toBe(false);
      expect(isSafeWebUrl(undefined)).toBe(false);
    });
  });

  describe("3. ANSI Escape Code Sanitization", () => {
    it("strips ANSI clear screen escape sequences", () => {
      const malicious = "\u001B[2J\u001B[0;0HClean Text";
      expect(sanitizeText(malicious)).toBe("Clean Text");
    });

    it("strips terminal window title manipulation codes", () => {
      const malicious = "\u001B]0;Hacked Title\u0007Eoin Traynor";
      expect(sanitizeText(malicious)).toBe("Eoin Traynor");
    });
  });

  describe("4. Massive string input & DoS resistance", () => {
    it("handles 10,000 character tagline without crashing and truncates cleanly", () => {
      const largeConfig: any = {
        name: "Mega User",
        handle: "mega",
        tagline: "A".repeat(10000),
        links: {},
      };
      expect(() => renderCard(largeConfig)).not.toThrow();
      const output = renderCard(largeConfig);
      expect(output).toContain("...");
    });
  });

  describe("5. Normalizer adversarial inputs", () => {
    it("handles protocol-only URLs", () => {
      expect(() => normalizeSocialLink("website", "https://")).not.toThrow();
    });

    it("handles Mastodon handles with excessive @ symbols", () => {
      expect(() => normalizeSocialLink("mastodon", "@@@@user@@@instance@@@")).not.toThrow();
    });
  });
});

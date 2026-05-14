import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./crypto";

describe("encrypt/decrypt", () => {
  it("round-trips a string", () => {
    const out = encrypt("hello-world");
    expect(out).toBeTypeOf("string");
    expect(decrypt(out)).toBe("hello-world");
  });

  it("returns null for null/undefined plaintext", () => {
    expect(encrypt(null)).toBeNull();
    expect(encrypt(undefined)).toBeNull();
  });

  it("returns null for null payload on decrypt", () => {
    expect(decrypt(null)).toBeNull();
    expect(decrypt("")).toBeNull();
  });

  it("returns null for malformed payload (wrong segment count)", () => {
    expect(decrypt("only-one-segment")).toBeNull();
    expect(decrypt("two:segments")).toBeNull();
  });

  it("produces different ciphertext for repeated plaintext (random IV)", () => {
    const a = encrypt("same");
    const b = encrypt("same");
    expect(a).not.toBe(b);
    expect(decrypt(a)).toBe("same");
    expect(decrypt(b)).toBe("same");
  });

  it("throws when payload tag is tampered", () => {
    const payload = encrypt("secret");
    const [iv, , data] = payload.split(":");
    const badTag = Buffer.from("0".repeat(16)).toString("base64");
    expect(() => decrypt(`${iv}:${badTag}:${data}`)).toThrow();
  });
});

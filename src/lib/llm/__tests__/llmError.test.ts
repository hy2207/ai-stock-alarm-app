import { describe, it, expect } from "vitest";
import { classifyLlmError } from "../llmError";

describe("classifyLlmError", () => {
  it("classifies timeout errors", () => {
    const err = new Error("Request timed out after 30000ms");
    const result = classifyLlmError(err);
    expect(result.type).toBe("timeout");
  });

  it("classifies abort errors as timeout", () => {
    const err = new DOMException("The operation was aborted", "AbortError");
    const result = classifyLlmError(err);
    expect(result.type).toBe("timeout");
  });

  it("classifies 429 rate limit errors", () => {
    const err = new Error("429 Too Many Requests");
    const result = classifyLlmError(err);
    expect(result.type).toBe("rate_limit");
  });

  it("classifies quota exceeded errors", () => {
    const err = new Error("Quota exceeded for API requests");
    const result = classifyLlmError(err);
    expect(result.type).toBe("rate_limit");
  });

  it("classifies 401 API key errors", () => {
    const err = new Error("401 Unauthorized - invalid API key");
    const result = classifyLlmError(err);
    expect(result.type).toBe("api_key");
  });

  it("classifies permission errors as api_key", () => {
    const err = new Error("Permission denied");
    const result = classifyLlmError(err);
    expect(result.type).toBe("api_key");
  });

  it("classifies 502 as api_error", () => {
    const err = new Error("502 Bad Gateway");
    const result = classifyLlmError(err);
    expect(result.type).toBe("api_error");
  });

  it("classifies 503 as api_error", () => {
    const err = new Error("503 Service Unavailable");
    const result = classifyLlmError(err);
    expect(result.type).toBe("api_error");
  });

  it("classifies server error messages as api_error", () => {
    const err = new Error("Internal Server Error");
    const result = classifyLlmError(err);
    expect(result.type).toBe("api_error");
  });

  it("classifies empty response as no_response", () => {
    const err = new Error("empty response from model");
    const result = classifyLlmError(err);
    expect(result.type).toBe("no_response");
  });

  it("classifies unknown errors", () => {
    const err = new Error("Something weird happened");
    const result = classifyLlmError(err);
    expect(result.type).toBe("unknown");
  });

  it("handles string errors", () => {
    const result = classifyLlmError("string error");
    expect(result.type).toBe("unknown");
  });

  it("handles null errors", () => {
    const result = classifyLlmError(null);
    expect(result.type).toBe("unknown");
  });

  it("handles object errors", () => {
    const result = classifyLlmError({ code: 500, message: "error" });
    expect(result.type).toBe("api_error");
  });

  it("preserves raw message in result", () => {
    const err = new Error("Custom network timeout issue");
    const result = classifyLlmError(err);
    expect(result.raw).toBe("Custom network timeout issue");
  });
});

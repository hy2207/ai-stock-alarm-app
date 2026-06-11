import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetServerSession = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock("../authOptions", () => ({
  authOptions: {},
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAuthSession", () => {
  it("returns session when user is authenticated", async () => {
    const session = { user: { id: "user-1" } };
    mockGetServerSession.mockResolvedValue(session);

    const { getAuthSession } = await import("../getServerSession");
    const result = await getAuthSession();

    expect(result).toEqual(session);
  });

  it("returns null when user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { getAuthSession } = await import("../getServerSession");
    const result = await getAuthSession();

    expect(result).toBeNull();
  });
});

describe("getCurrentUserId", () => {
  it("returns user id when session exists", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });

    const { getCurrentUserId } = await import("../getServerSession");
    const result = await getCurrentUserId();

    expect(result).toBe("user-1");
  });

  it("returns null when session is null", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { getCurrentUserId } = await import("../getServerSession");
    const result = await getCurrentUserId();

    expect(result).toBeNull();
  });

  it("returns null when session has no user", async () => {
    mockGetServerSession.mockResolvedValue({});

    const { getCurrentUserId } = await import("../getServerSession");
    const result = await getCurrentUserId();

    expect(result).toBeNull();
  });

  it("returns null when session has user without id", async () => {
    mockGetServerSession.mockResolvedValue({ user: {} });

    const { getCurrentUserId } = await import("../getServerSession");
    const result = await getCurrentUserId();

    expect(result).toBeNull();
  });
});

// Shared test helpers for API route tests.
export function makeReq(body, { method = "POST" } = {}) {
  const init = { method, headers: { "content-type": "application/json" } };
  if (body !== undefined) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  return new Request("http://localhost/api/test", init);
}

export function mockSession(overrides = {}) {
  return {
    spotifyId: "user-1",
    accessToken: "fake-access",
    user: { name: "Test", email: "t@e.com" },
    ...overrides,
  };
}

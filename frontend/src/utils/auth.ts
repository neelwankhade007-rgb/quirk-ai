export const ACCESS_TOKEN_KEY = "access_token";
export const AUTH_EXPIRED_EVENT = "quirkai:auth-expired";

export function getTokenExpiration(token: string): number | null {
  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) {
    return null;
  }

  try {
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const payload: unknown = JSON.parse(window.atob(paddedBase64));

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("exp" in payload) ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  return expiration === null || expiration <= Date.now();
}

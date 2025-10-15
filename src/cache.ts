import type { TokenResponse } from "./types.js";

export class TokenCache {
  private tokenData: TokenResponse | null = null;

  set(token: TokenResponse) {
    token.created_at = Math.floor(Date.now() / 1000);
    this.tokenData = token;
  }

  get(): TokenResponse | null {
    if (!this.tokenData) return null;
    const now = Math.floor(Date.now() / 1000);
    const expiry = (this.tokenData.created_at || 0) + (this.tokenData.expires_in || 0);
    if (now >= expiry - 30) return null; // refresh 30s early
    return this.tokenData;
  }

  clear() {
    this.tokenData = null;
  }
}

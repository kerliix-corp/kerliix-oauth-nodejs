import type { KerliixConfig, TokenResponse, UserInfo } from "./types.js";
import { TokenCache } from "./cache.js";

export default class KerliixOAuth {
  private config: KerliixConfig;
  private cache: TokenCache;

  constructor(config: KerliixConfig) {
    if (!config.clientId || !config.redirectUri || !config.baseUrl)
      throw new Error("Missing required config: clientId, redirectUri, or baseUrl");

    this.config = {
      ...config,
      baseUrl: config.baseUrl.replace(/\/$/, "")
    };
    this.cache = new TokenCache();
  }

  getAuthUrl(scopes: string[] = ["openid", "profile", "email"], state = ""): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      state
    });
    return `${this.config.baseUrl}/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const res = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      })
    });
    if (!res.ok) throw new Error(`Token exchange failed: ${res.statusText}`);
    const token = await res.json() as TokenResponse;
    this.cache.set(token);
    return token;
  }

  async refreshTokenIfNeeded(): Promise<TokenResponse | null> {
    const cached = this.cache.get();
    if (cached) return cached;

    const last = this.cache["tokenData"];
    if (!last?.refresh_token) return null;

    const res = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: last.refresh_token,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      })
    });
    if (!res.ok) throw new Error("Failed to refresh token");
    const token = await res.json() as TokenResponse;
    this.cache.set(token);
    return token;
  }

  async getUserInfo(accessToken?: string): Promise<UserInfo> {
    const token = accessToken || (await this.refreshTokenIfNeeded())?.access_token;
    if (!token) throw new Error("Missing access token");
    const res = await fetch(`${this.config.baseUrl}/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch user info");
    return res.json() as Promise<UserInfo>;
  }

  async revokeToken(token: string): Promise<boolean> {
    const res = await fetch(`${this.config.baseUrl}/oauth/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    if (res.ok) this.cache.clear();
    return res.ok;
  }
}

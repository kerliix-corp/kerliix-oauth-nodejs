import type { KerliixConfig, TokenResponse, UserInfo } from "./types.js";
import { TokenCache } from "./cache.js";
import { OAuthError } from "./types.js";

// --- PKCE helpers ---
function base64URLEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64URLEncode(hash);
}

// --- KerliixOAuth class ---
export default class KerliixOAuth {
  private config: KerliixConfig;
  private cache: TokenCache;

  constructor(config: KerliixConfig) {
    if (!config.clientId || !config.redirectUri) {
      throw new Error("Missing required config: clientId or redirectUri");
    }

    // Default OAuth server URL if not provided
    const DEFAULT_BASE_URL = "http://localhost:4000";

    this.config = {
      ...config,
      baseUrl: (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, ""),
    };

    this.cache = new TokenCache();
    console.log("OAuth server URL:", this.config.baseUrl); // optional logging
  }

  // --- Generate Authorization URL ---
  async getAuthUrl(
    scopes: string[] = ["openid", "profile", "email"],
    state = "",
    usePKCE = false
  ): Promise<{ url: string; codeVerifier?: string }> {
    const params: Record<string, string> = {
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      state,
    };

    let codeVerifier: string | undefined;

    if (usePKCE) {
      codeVerifier = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => ("00" + b.toString(16)).slice(-2))
        .join("");
      const codeChallenge = await sha256(codeVerifier);
      params["code_challenge"] = codeChallenge;
      params["code_challenge_method"] = "S256";
    }

    const url = `${this.config.baseUrl}/oauth/authorize?${new URLSearchParams(params).toString()}`;
    return { url, codeVerifier };
  }

  // --- Exchange code for tokens ---
  async exchangeCodeForToken(code: string, codeVerifier?: string): Promise<TokenResponse> {
    if (!code) throw new OAuthError("invalid_request", "Authorization code is required");

    const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };

    if (this.config.clientSecret) {
      const basicAuth = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      headers["Authorization"] = `Basic ${basicAuth}`;
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.config.redirectUri,
    });

    if (codeVerifier) body.set("code_verifier", codeVerifier);

    const res = await fetch(`${this.config.baseUrl}/oauth/token`, { method: "POST", headers, body });
    const data = await this.handleFetchResponse(res, "token_exchange_failed");

    this.cache.set(data as TokenResponse);
    return data as TokenResponse;
  }

  // --- Refresh token ---
  async refreshTokenIfNeeded(): Promise<TokenResponse | null> {
    const cached = this.cache.get();
    if (cached) return cached;

    const last = this.cache["tokenData"];
    if (!last?.refresh_token || !this.config.clientSecret) return null;

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`,
    };
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: last.refresh_token,
    });

    const res = await fetch(`${this.config.baseUrl}/oauth/token`, { method: "POST", headers, body });
    const data = await this.handleFetchResponse(res, "refresh_failed");

    this.cache.set(data as TokenResponse);
    return data as TokenResponse;
  }

  // --- Get user info ---
  async getUserInfo(accessToken?: string): Promise<UserInfo> {
    const token = accessToken || (await this.refreshTokenIfNeeded())?.access_token;
    if (!token) throw new OAuthError("missing_token", "No access token available");

    const res = await fetch(`${this.config.baseUrl}/oauth/userinfo`, { headers: { Authorization: `Bearer ${token}` } });
    return (await this.handleFetchResponse(res, "userinfo_fetch_failed")) as UserInfo;
  }

  // --- Revoke token ---
  async revokeToken(token: string): Promise<boolean> {
    if (!token) throw new OAuthError("invalid_request", "Token is required");
    if (!this.config.clientSecret) throw new OAuthError("unauthorized_client", "Client secret required");

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`,
    };
    const body = new URLSearchParams({ token });

    await this.handleFetchResponse(await fetch(`${this.config.baseUrl}/oauth/revoke`, { method: "POST", headers, body }), "revoke_failed");
    this.cache.clear();
    return true;
  }

  // --- Centralized fetch response handler ---
  private async handleFetchResponse(res: Response, defaultError = "unknown_error") {
    const contentType = res.headers.get("content-type") || "";
    let data: any = {};

    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      const text = await res.text().catch(() => "");
      data = { error: defaultError, error_description: text };
    }

    if (!res.ok || data.error) {
      throw new OAuthError(data.error || defaultError, data.error_description || "No description");
    }

    return data;
  }
}

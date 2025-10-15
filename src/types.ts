export interface KerliixConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  baseUrl: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  created_at?: number;
}

export interface UserInfo {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

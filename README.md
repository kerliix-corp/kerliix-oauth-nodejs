# Kerliix OAuth SDK

> Official Kerliix OAuth 2.0 SDK for Node.js and Browser

[![npm version](https://img.shields.io/npm/v/kerliix-oauth.svg)](https://www.npmjs.com/package/kerliix-oauth)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/kerliix/kerliix-oauth/build.yml)](https://github.com/kerliix/kerliix-oauth/actions)

---

## Overview

**Kerliix OAuth** provides a simple and secure way to integrate Kerliix authentication into your Node.js or browser-based apps.
It handles the full OAuth 2.0 flow including:

* Building authorization URLs
* Exchanging authorization codes for tokens
* Token caching & auto-refresh
* Fetching user profile data
* Revoking tokens

Built with **TypeScript**, compatible with both **Node.js** and **browser environments**.

---

## Installation

```bash
npm install kerliix-oauth
```

or using yarn:

```bash
yarn add kerliix-oauth
```

---

## Quick Start

```js
import KerliixOAuth from "kerliix-oauth";

const client = new KerliixOAuth({
  clientId: "YOUR_CLIENT_ID",
  clientSecret: "YOUR_CLIENT_SECRET",
  redirectUri: "https://yourapp.com/callback",
  baseUrl: "https://auth.kerliix.com"
});

// Step 1: Redirect user to login
const authUrl = client.getAuthUrl(["openid", "profile", "email"]);
console.log("Login via:", authUrl);

// Step 2: Exchange the code for tokens
// const token = await client.exchangeCodeForToken("OAUTH_CODE");

// Step 3: Fetch user profile
// const user = await client.getUserInfo(token.access_token);
```

---

## Configuration Options

| Option         | Required | Description                                                  |
| -------------- | -------- | ------------------------------------------------------------ |
| `clientId`     | ✅        | Your app’s client ID from Kerliix developer portal           |
| `clientSecret` | ⚙️       | Required for server-side (authorization code flow)           |
| `redirectUri`  | ✅        | The callback URI registered in your app                      |
| `baseUrl`      | ✅        | Your Kerliix OAuth base URL, e.g. `https://auth.kerliix.com` |

---

## 🔐 OAuth Flow

1. **User clicks login** → Redirect to Kerliix via `getAuthUrl()`
2. **Kerliix authenticates** → Redirects back with `?code=XYZ`
3. **Your app exchanges code** → `exchangeCodeForToken(code)`
4. **Use token** → Access user data via `getUserInfo()`
5. **Optional** → Automatically refresh expired tokens

---

## API Reference

### `new KerliixOAuth(config)`

Initializes the client.

```js
const client = new KerliixOAuth({
  clientId: "...",
  clientSecret: "...",
  redirectUri: "...",
  baseUrl: "https://auth.kerliix.com"
});
```

---

### `getAuthUrl(scopes?: string[], state?: string): string`

Generates an authorization URL for login/consent.

```js
const url = client.getAuthUrl(["openid", "profile", "email"], "xyz123");
```

---

### `exchangeCodeForToken(code: string): Promise<TokenResponse>`

Exchanges an authorization code for access and refresh tokens.

---

### `refreshTokenIfNeeded(): Promise<TokenResponse | null>`

Checks if the token is expiring and automatically refreshes it if needed.

---

### `getUserInfo(accessToken?: string): Promise<UserInfo>`

Fetches the user’s profile data using a valid access token.

---

### `revokeToken(token: string): Promise<boolean>`

Revokes an access or refresh token.

---

## Token Caching

The SDK automatically caches tokens in memory and:

* Refreshes them **30 seconds before expiry**
* Clears cache when tokens are revoked
* Works seamlessly in Node.js and browser environments

---

## License

MIT © Kerliix Corporation

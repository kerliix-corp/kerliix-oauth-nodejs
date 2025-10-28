# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0/).

---

## Quick Start / Known Issues (Local Development)
- **TypeScript syntax cannot run directly in Node.js** without compiling. Use `tsc` to build before running.
- **Do not use `!` non-null assertions** in runtime code (`CLIENT_ID!`) – they are TypeScript-only and will break Node.js execution.
- Exported functions with TypeScript types (e.g., `code: string`) will throw syntax errors if run uncompiled.
- Always handle runtime errors from SDK methods:
  - `"Missing required config: clientId, redirectUri, or baseUrl"`
  - `"Token exchange failed: <status> <statusText>. Response: <body>"`
  - `"Failed to refresh token"`
  - `"Missing access token"`
  - `"Failed to fetch user info"`
  - `revokeToken()` may return `false` if revocation fails.
- Use compiled `dist/` files for testing locally instead of raw `.ts` files.

---

## [1.3.0] - 2025-10-28

### Added
- **TypeScript client wrapper (`client.ts`)** for Node.js, replacing raw JS SDK initialization.
  - Automatically uses **default OAuth server URL (`http://localhost:4000`)** if none is provided.
  - Maintains helper functions for OAuth flows:
    - `getAuthorizeUrl(state?: string)` – generates authorization URLs with optional PKCE.
    - `exchangeCodeForTokens(code: string)` – exchanges authorization codes for access/refresh tokens.
    - `fetchUserInfo(accessToken?: string)` – fetches authenticated user profile; auto-refreshes tokens if expired.
    - `refreshTokenIfNeeded()` – refreshes tokens automatically when expired.
    - `revokeToken(token: string)` – revokes access or refresh tokens.
- **Client authentication middleware** (`middlewares/clientAuth.js`) for validating Basic Auth with clientId/clientSecret.
  - Attaches verified client object to `req.oauth2.client` and `req.user`.
  - Returns descriptive errors for missing credentials or mismatched secrets.
  - Includes logging for missing clients or secret mismatches.
- **Enhanced PKCE support**:
  - Secure code verifier and code challenge generation for public clients.

### Changed
- Migration from JS-only SDK usage to **TypeScript-based client initialization**.
- Client initialization no longer requires `baseUrl`; defaults to `http://localhost:4000`.
- Improved logging throughout the SDK for all OAuth operations.
- Internal request handling now aligns with standard OAuth 2.0 Authorization Code Flow.
- Token caching and refresh logic remain consistent with OAuth 2.0 standards.

### Fixed
- Fixed minor issues in PKCE encoding to ensure compatibility with OAuth servers expecting base64url-encoded SHA-256 challenges.

---

## [1.0.2] - 2025-10-27
### Added
- **`checkAuthorizationUrl()` method** to pre-validate client ID and redirect URI against the OAuth server.
  - Sends a `HEAD` request and checks for errors without triggering full redirects.
  - Logs success or throws descriptive errors for misconfiguration.
- Enhanced **error details** in `exchangeCodeForToken()`:
  - Includes HTTP status, status text, and server response body when available.
- Improved logging across all SDK methods to show `err.message` for clarity.
- Better **developer insight** for debugging OAuth integration issues.

### Changed
- Minor refactor for more readable error logging (`err.message || err`) in:
  - `exchangeCodeForToken()`
  - `refreshTokenIfNeeded()`
  - `getUserInfo()`
  - `revokeToken()`
- Documentation and examples updated to highlight new `checkAuthorizationUrl()` usage.

### Fixed
- No functional bugs fixed; updates are focused on **developer experience and diagnostics**.

---

## [1.0.1] - 2025-10-27
### Added
- **Runtime error documentation** for the SDK:
  - `"Missing required config: clientId, redirectUri, or baseUrl"` in `KerliixOAuth` constructor.
  - `"Token exchange failed: <statusText>"` in `exchangeCodeForToken()`.
  - `"Failed to refresh token"` in `refreshTokenIfNeeded()`.
  - `null` returned from `refreshTokenIfNeeded()` or `TokenCache.get()` if no valid token exists.
  - `"Missing access token"` in `getUserInfo()` if no access token is available.
  - `"Failed to fetch user info"` if user info request fails.
  - `revokeToken()` returns `false` if token revocation fails.
- Enhanced **developer experience** with clearer SDK error messages and handling instructions.
- Minor improvements to TypeScript typings and internal caching logic.

### Changed
- SDK version bumped from `1.0.0-beta.1` to `1.0.1`.
- Documentation and examples updated to highlight error handling.

### Fixed
- N/A (no functional changes; only runtime errors clarified).

---

## [1.0.0-beta.1] - 2025-10-15
### Added
- **Initial beta release** of the official **Kerliix OAuth SDK** for Node.js and browser.
- Support for **OAuth 2.0 Authorization Code Flow**.
- `KerliixOAuth` main client class for authentication and token management.
- `getAuthUrl()` method to generate authorization URLs.
- `exchangeCodeForToken()` to exchange authorization codes for tokens.
- `refreshTokenIfNeeded()` to refresh tokens automatically.
- `getUserInfo()` to fetch authenticated user profile information.
- `revokeToken()` to revoke issued tokens.
- In-memory **token caching** with early refresh via `TokenCache`.
- TypeScript support with full type definitions (`types.ts`).

### Fixed
- N/A (initial release).

### Changed
- N/A (initial release).

---

## [Unreleased]
### Planned
- Add PKCE (Proof Key for Code Exchange) support for better security.
- Persistent caching options (file system or Redis).
- Improved browser compatibility and npm publishing.
- Unit tests and CI/CD integration.

---

**Repository:** [kerliix-corp/kerliix-oauth-nodejs](https://github.com/kerliix-corp/kerliix-oauth-nodejs)  
**License:** MIT © Kerliix Corporation

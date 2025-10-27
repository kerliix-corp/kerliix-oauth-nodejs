# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Quick Start / Known Issues (Local Development)
- **TypeScript syntax cannot run directly in Node.js** without compiling. Use `tsc` to build before running.
- **Do not use `!` non-null assertions** in runtime code (`CLIENT_ID!`) – they are TypeScript-only and will break Node.js execution.
- Exported functions with TypeScript types (e.g., `code: string`) will throw syntax errors if run uncompiled.
- Always handle runtime errors from SDK methods:
  - `"Missing required config: clientId, redirectUri, or baseUrl"`
  - `"Token exchange failed: <statusText>"`
  - `"Failed to refresh token"`
  - `"Missing access token"`
  - `"Failed to fetch user info"`
  - `revokeToken()` may return `false` if revocation fails.
- Use compiled `dist/` files for testing locally instead of raw `.ts` files.

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

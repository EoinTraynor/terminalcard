# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2](https://github.com/EoinTraynor/terminalcard/compare/v1.0.1...v1.0.2) (2026-09-14)

### Bug Fixes & Security Hardening
* **security:** restrict interactive menu URL protocol handler strictly to `http:` and `https:` (`isSafeWebUrl`)
* **security:** sanitize untrusted strings from remote JSON/APIs to strip CSI/OSC ANSI control sequences (`sanitizeText`)
* **resilience:** guard `links` and `customLinks` schema parsing against null/undefined/non-array data
* **resilience:** handle GitHub API HTTP 403/429 rate-limiting with informative error guidance
* **local:** prevent collisions between card usernames and local files/directories (`dist`, `test`, `cards`)

## [1.0.1](https://github.com/EoinTraynor/terminalcard/compare/v1.0.0...v1.0.1) (2026-09-14)

### CI / CD
* **ci:** configure GitHub Actions Trusted Publisher OIDC with SLSA v1 provenance

## 1.0.0 (2026-09-14)

### Features
* **runner:** universal terminal business card runner (`npx terminalcard <user>`)
* **wizard:** interactive card generator (`npx terminalcard init`)
* **resolver:** 3-tier waterfall resolution (GitHub profile `.terminalcard.json` -> local registry `cards/<user>.json` -> public GitHub API fallback)
* **ui:** responsive terminal card rendering with box borders, OSC 8 hyperlinks, and interactive menu

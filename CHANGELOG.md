# Changelog



All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-05-31
- Refactored authentication to use a global user context (`UserContext.tsx`) with localStorage persistence for login state across reloads.
- Wrapped the app in `UserProvider` in `app/layout.tsx` to provide global user state.
- Updated login/logout/navigation flows to use global user state, matching requirements:
  - Login from `/car-marketplace` → `/login` → `/dashboard` sets user state and persists it.
  - Navigating between `/dashboard` and `/car-marketplace` does NOT log the user out.
  - User can only log out from `/profile-settings`, which clears user state and routes to `/car-marketplace`.
  - User state persists across all new pages (dashboard, car-marketplace, login, profile-settings, etc.).
  - Login state persists across page reloads (using localStorage).
  - Login button in car-marketplace always routes to `/login` (never toggles a local modal).
  - After login, user is always routed to `/dashboard` (or `/upload-vehicle` if login was triggered by a sell/upload action).
- Refactored `CarMarketplace`, `LoginClient`, `DashboardClient`, and `ProfileSettingsClient` to use the global user context instead of local state.
- Updated all navigation handlers in `CarMarketplace` to use `HeaderPropsOverride` if provided, ensuring consistent navigation and login routing.
- Added null user guards to `Dashboard` to prevent runtime errors if user is not logged in.
- Refactored other pages/components to use the global user context and added user state guards where appropriate.
- Implemented mock login logic in `login-page.tsx` for development credentials (`justxrow@gmail.com` / `2547896314`).
- Updated login form to use client-side navigation (`router.push`) instead of `window.location.href` to preserve user state.
- Updated social login buttons to use a complete mock user object matching `UserProfile`.
- Updated sign out in `ProfileSettingsClient.tsx` to clear user state and route to `/car-marketplace`.
- Ensured dashboard and profile settings use user context, not local state.
- Updated the changelog to reflect all recent authentication, navigation, and mock login changes.
- Ensured all navigation handlers and user guards use the global user context.

## [Unreleased] - 2025-05-30
- Refactored authentication to use a global user context (`UserContext.tsx`) with localStorage persistence for login state across reloads.
- Wrapped the app in `UserProvider` in `app/layout.tsx` to provide global user state.
- Updated login/logout/navigation flows to use global user state, matching requirements:
  - Login from `/car-marketplace` → `/login` → `/dashboard` sets user state and persists it.
  - Navigating between `/dashboard` and `/car-marketplace` does NOT log the user out.
  - User can only log out from `/profile-settings`, which clears user state and routes to `/login`.
  - User state persists across all new pages (dashboard, car-marketplace, login, profile-settings, etc.).
  - Login state persists across page reloads (using localStorage).
  - Login button in car-marketplace always routes to `/login` (never toggles a local modal).
  - After login, user is always routed to `/dashboard` (or `/upload-vehicle` if login was triggered by a sell/upload action).
- Refactored `CarMarketplace`, `LoginClient`, `DashboardClient`, and `ProfileSettingsClient` to use the global user context instead of local state.
- Updated all navigation handlers in `CarMarketplace` to use `HeaderPropsOverride` if provided, ensuring consistent navigation and login routing.
- Added null user guards to `Dashboard` to prevent runtime errors if user is not logged in.
- (Optional) Refactored other pages/components to use the global user context and added user state guards where appropriate.


## [Unreleased] - 2025-05-31
- **Authentication & User Context**
  - Refactored authentication to use a global user context (`UserContext.tsx`).
  - Removed auto-login from localStorage: user is only set after explicit login.
  - User state is persisted to localStorage after login, but not loaded automatically on page load.
  - Wrapped the app in `UserProvider` in `app/layout.tsx` to provide global user state.
  - Login/logout/navigation flows updated:
    - Login from `/car-marketplace` → `/login` → `/dashboard` sets user state.
    - Navigating between `/dashboard` and `/car-marketplace` does NOT log the user out.
    - User can only log out from `/profile-settings`, which clears user state and now routes to `/car-marketplace`.
    - Login button in car-marketplace always routes to `/login`.
    - After login, user is always routed to `/dashboard` (or `/upload-vehicle` if login was triggered by a sell/upload action).
    - Added null user guards to `Dashboard` to prevent runtime errors if user is not logged in.
  - Refactored `CarMarketplace`, `LoginClient`, `DashboardClient`, and `ProfileSettingsClient` to use the global user context instead of local state.
  - Updated all navigation handlers in `CarMarketplace` to use `HeaderPropsOverride` if provided, ensuring consistent navigation and login routing.
  - (Optional) Refactored other pages/components to use the global user context and added user state guards where appropriate.

- **Login & Mock Auth**
  - Implemented mock login logic in the login form: logging in with `justxrow@gmail.com` / `2547896314` sets a temp user and routes to dashboard.
  - Social login buttons (Google, Facebook, Apple) also set a temp user with all required fields for testing.
  - Login now uses client-side navigation (`router.push`) to preserve user state after login.

- **Sign Out**
  - Sign out from profile-settings now routes to `/car-marketplace` instead of `/login`.

- **Other**
  - Fixed dashboard and profile settings to always use user context.
  - Updated changelog to reflect all recent authentication and navigation changes.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Initial changelog created. All future changes will be tracked here as development continues.

## [Unreleased] - 2025-05-30
- Added `/app/upload-vehicle/page.tsx` route to render the UploadVehicle component and fix 404 errors for Sell a Car/Upload Vehicle navigation.
- Created `/app/upload-vehicle/UploadVehicleClient.tsx` as a Client Component wrapper for UploadVehicle to support interactive props and Next.js App Router requirements.
- Updated `/app/upload-vehicle/page.tsx` to use the new Client Component for proper routing and interactivity.
- Fixed import/export and routing issues for UploadVehicle, ensuring correct default export and usage.
- Documented the above changes for future reference.

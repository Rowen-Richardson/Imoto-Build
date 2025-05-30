# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Initial changelog created. All future changes will be tracked here as development continues.

## [Unreleased] - 2025-05-30
- Added `/app/upload-vehicle/page.tsx` route to render the UploadVehicle component and fix 404 errors for Sell a Car/Upload Vehicle navigation.
- Created `/app/upload-vehicle/UploadVehicleClient.tsx` as a Client Component wrapper for UploadVehicle to support interactive props and Next.js App Router requirements.
- Updated `/app/upload-vehicle/page.tsx` to use the new Client Component for proper routing and interactivity.
- Fixed import/export and routing issues for UploadVehicle, ensuring correct default export and usage.
- Documented the above changes for future reference.

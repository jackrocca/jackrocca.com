# UI source provenance

Kitze UI components were installed on 2026-09-08 from the official source registry at https://ui.kitze.io/r/ using the documented installation process at https://ui.kitze.io/guide. Installed entry points: custom-button, social-login-button, input, checkbox, simple-select, responsive-dialog, ui-alert, segmented-control, simple-accordion, custom-badge, page-header, and dialog-manager, including their registry dependencies.

The registry’s linked repository https://github.com/kitze/kitze-ui-registry was unavailable when checked. No standalone upstream license was supplied in the retrieved registry items; this notice records provenance and does not assign a license to upstream code. Preserve any upstream notices in later registry updates.

Base UI, shadcn, and other npm dependencies retain their license files in their distributed packages. Application-specific adaptations are described in README.md.

## Complete source snapshot and local fork

The full published registry was downloaded on 2026-09-08 into `vendor/kitze-ui/`: 76 registry entries and 134 original source files, plus official documentation and SHA-256 checksums. The customized working library lives in `ui/`; upstream identifiers and attribution are preserved. This is a local source fork, not a GitHub fork of the unavailable upstream repository. See `ui/README.md` for the update process.

The supplied Jack Rocca logo is preserved in `assets/brand/jack-rocca-logo.original.svg`. The navbar copy only tightens the SVG canvas bounds around the original artwork. The file embeds raster artwork inside its SVG; it has not been redrawn or represented as a pure vector logo.

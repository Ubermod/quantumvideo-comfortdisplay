# companion-module-quantumvideo-comfortdisplay

Bitfocus Companion module for ComfortDisplay. See [companion/HELP.md](companion/HELP.md) for what it does and how to use it.

## Install without building

Import the packaged `quantumvideo-comfortdisplay-<version>.tgz` on Companion's **Modules** page. The connection then appears under **Quantum Video: ComfortDisplay** when you add a connection.

## Develop

Requires Node.js 22.

```
npm install
npm run check      # validates the manifest and package
npm run package    # builds quantumvideo-comfortdisplay-<version>.tgz
```

To run from source, point Companion's **Developer modules** folder (launcher → cog → Advanced Settings) at the folder that *contains* this module folder, after `npm install`. Companion reloads the module whenever a file changes.

## Files

```
companion/manifest.json   module identity and runtime
companion/HELP.md         help shown in Companion
src/main.js               connection lifecycle and config
src/client.js             WebSocket (live state) and HTTP (commands) to ComfortDisplay
src/actions.js            actions
src/feedbacks.js          feedbacks
src/variables.js          variables
src/presets.js            ready-made buttons
src/upgrades.js           upgrade scripts (none yet)
```

## Releasing to the Companion store

1. Request a repository named `companion-module-quantumvideo-comfortdisplay` in the Bitfocus Developer Portal (developer.bitfocus.io) and push this code to it.
2. Set `version` in `package.json` (for example `1.0.0`) and tag the commit `v1.0.0`.
3. In the portal, go to **My Connections**, choose the module, click **Submit Version**, and pick the tag.

Reviewers may ask for the newer `@companion-module/base` 2.x API. This module uses 1.14 so that it runs on Companion 4.2 and later.

# companion-module-quantumvideo-comfortdisplay

Bitfocus Companion module for ComfortDisplay. See [companion/HELP.md](companion/HELP.md) for what it does and how to use it.

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

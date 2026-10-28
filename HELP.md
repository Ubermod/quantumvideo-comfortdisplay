## ComfortDisplay

Controls ComfortDisplay, the full-screen presenter display for DSAN Limitimer time and PerfectCue arrows, and shows its live status on your buttons.

### Setup

1. Start ComfortDisplay on the display computer.
2. Add this connection and enter that computer's **IP address** and ComfortDisplay's **port** (8080 unless you changed it in ComfortDisplay's Window tab). Use `127.0.0.1` if Companion runs on the same computer.
3. The connection turns green once it reaches ComfortDisplay. If it stays red, check the address, the port, and that Windows Firewall allows ComfortDisplay on the network.

The fastest start is the **Presets** tab: drag the buttons you want onto a page.

### Actions

- **Full screen**: on, off, or toggle.
- **Show message**: type the message right in the action. Variables are allowed, for example `$(internal:custom_note)`. Leave it empty to show whatever is already typed in ComfortDisplay. Optionally turn blinking on or off at the same time.
- **Hide message**.
- **Show or hide message (toggle)**.
- **Set message text (without showing it)**: if the message is already up, the new text appears straight away.
- **Show a quick message**: pick from the quick messages saved in ComfortDisplay's Message tab.
- **Message blink**: on, off, or toggle.
- **Set the display's clock to this computer's time**, and **Use the display computer's own clock**.

### Feedbacks

- Display is full screen
- Message is showing
- Message blink is on
- Timer phase (green, yellow, red)
- No Limitimer data
- PerfectCue light is on (forward, reverse, blank)
- Source is connected (Limitimer, PerfectCue)

### Variables

| Variable | Contains |
|---|---|
| `timer` | What the display shows now, e.g. `4:59` or `+0:12` |
| `timer_remaining`, `timer_total`, `timer_elapsed` | The Limitimer's times |
| `timer_phase` | `green`, `yellow`, `red` or `none` |
| `timer_running`, `timer_program`, `timer_data` | Running state, selected program, and whether data is arriving |
| `clock` | Time of day on the display |
| `message`, `message_showing`, `message_blink` | The message and its state |
| `fullscreen` | `true` or `false` |
| `cue_forward`, `cue_reverse`, `cue_blank` | PerfectCue lights, `true` or `false` |
| `limitimer_connection`, `cue_connection` | Source status text |

Use them in button text as `$(comfortdisplay:timer)`, replacing `comfortdisplay` with this connection's label if you renamed it.

### Requirements

Companion 4.2 or later, and a ComfortDisplay version that includes the full-screen and message-toggle API (October 2026 or later).

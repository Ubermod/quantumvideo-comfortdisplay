const VARIABLES = [
	{ variableId: 'timer', name: 'Timer: what the display shows now' },
	{ variableId: 'timer_remaining', name: 'Timer: time remaining (overtime shown as +m:ss)' },
	{ variableId: 'timer_total', name: 'Timer: total (preset) time' },
	{ variableId: 'timer_elapsed', name: 'Timer: elapsed time (Limitimer network or USB connection)' },
	{ variableId: 'timer_phase', name: 'Timer: phase (green, yellow, red or none)' },
	{ variableId: 'timer_running', name: 'Timer: running (true or false)' },
	{ variableId: 'timer_program', name: 'Timer: selected Limitimer program' },
	{ variableId: 'timer_data', name: 'Timer: receiving Limitimer data (true or false)' },
	{ variableId: 'clock', name: 'Time of day on the display' },
	{ variableId: 'message', name: 'Message: text' },
	{ variableId: 'message_showing', name: 'Message: showing (true or false)' },
	{ variableId: 'message_blink', name: 'Message: blink on (true or false)' },
	{ variableId: 'fullscreen', name: 'Display: full screen (true or false)' },
	{ variableId: 'cue_forward', name: 'PerfectCue: forward arrow lit (true or false)' },
	{ variableId: 'cue_reverse', name: 'PerfectCue: reverse arrow lit (true or false)' },
	{ variableId: 'cue_blank', name: 'PerfectCue: blank light on (true or false)' },
	{ variableId: 'limitimer_connection', name: 'Limitimer source status' },
	{ variableId: 'cue_connection', name: 'PerfectCue source status' },
]

// The time ComfortDisplay is drawing right now, following its "when data stops" setting.
function shownTime(config, state) {
	const lt = state && state.limitimer
	if (!config || !lt) return ''
	const placeholder = (config.style && config.style.timer && config.style.timer.placeholder) ?? '--:--'
	const field = (config.limitimer && config.limitimer.timeField) || 'RTSTR'
	const value = lt.times && lt.times[field]
	if (lt.stale) {
		const behaviour = config.limitimer && config.limitimer.staleBehavior
		if (behaviour === 'clock') return (state.clock && state.clock.text) || placeholder
		if (behaviour === 'blank') return ''
		if (behaviour === 'dash' || value == null) return placeholder
	}
	return value == null ? placeholder : String(value).trim()
}

function computeValues(config, state) {
	const lt = (state && state.limitimer) || {}
	const cue = (state && state.cue) || {}
	const times = lt.times || {}
	const msg = (config && config.message) || {}
	const net = lt.network || null
	const bool = (v) => (v ? 'true' : 'false')
	return {
		timer: shownTime(config, state),
		timer_remaining: times.RTSTR ?? '',
		timer_total: times.TTSTR ?? '',
		timer_elapsed: times.ETSTR ?? '',
		timer_phase: lt.phase || 'none',
		timer_running: lt.running === undefined ? '' : bool(lt.running),
		timer_program: net ? net.programName : '',
		timer_data: bool(!lt.stale),
		clock: (state && state.clock && state.clock.text) || '',
		message: msg.text || '',
		message_showing: bool(msg.showing),
		message_blink: bool(msg.blink),
		fullscreen: bool(config && config.window && config.window.fullscreen),
		cue_forward: bool(cue.forward),
		cue_reverse: bool(cue.reverse),
		cue_blank: bool(cue.blank),
		limitimer_connection: (lt.status && lt.status.detail) || '',
		cue_connection: (cue.status && cue.status.detail) || '',
	}
}

module.exports = { VARIABLES, computeValues, shownTime }

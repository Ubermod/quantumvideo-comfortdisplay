const { combineRgb } = require('@companion-module/base')

const GREEN = combineRgb(0, 150, 60)
const YELLOW = combineRgb(230, 180, 0)
const RED = combineRgb(200, 20, 20)
const BLUE = combineRgb(0, 90, 200)
const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)

function getFeedbacks(self) {
	const cfg = () => self.client.config || {}
	const st = () => self.client.state || {}

	return {
		fullscreen: {
			type: 'boolean',
			name: 'Display is full screen',
			defaultStyle: { bgcolor: GREEN, color: WHITE },
			options: [],
			callback: () => !!(cfg().window && cfg().window.fullscreen),
		},
		message_showing: {
			type: 'boolean',
			name: 'Message is showing',
			defaultStyle: { bgcolor: YELLOW, color: BLACK },
			options: [],
			callback: () => !!(cfg().message && cfg().message.showing),
		},
		message_blink: {
			type: 'boolean',
			name: 'Message blink is on',
			defaultStyle: { bgcolor: BLUE, color: WHITE },
			options: [],
			callback: () => !!(cfg().message && cfg().message.blink),
		},
		timer_phase: {
			type: 'boolean',
			name: 'Timer phase',
			description: 'Green while counting, yellow near the end, red at zero and overtime',
			defaultStyle: { bgcolor: RED, color: WHITE },
			options: [
				{
					type: 'dropdown',
					id: 'phase',
					label: 'Phase',
					default: 'red',
					choices: [
						{ id: 'green', label: 'Green' },
						{ id: 'yellow', label: 'Yellow' },
						{ id: 'red', label: 'Red' },
					],
				},
			],
			callback: (fb) => {
				const lt = st().limitimer
				return !!(lt && !lt.stale && lt.phase === fb.options.phase)
			},
		},
		timer_no_data: {
			type: 'boolean',
			name: 'No Limitimer data',
			defaultStyle: { bgcolor: combineRgb(60, 60, 60), color: combineRgb(170, 170, 170) },
			options: [],
			callback: () => !!(st().limitimer && st().limitimer.stale),
		},
		cue_lit: {
			type: 'boolean',
			name: 'PerfectCue light is on',
			defaultStyle: { bgcolor: GREEN, color: WHITE },
			options: [
				{
					type: 'dropdown',
					id: 'light',
					label: 'Light',
					default: 'forward',
					choices: [
						{ id: 'forward', label: 'Forward (green)' },
						{ id: 'reverse', label: 'Reverse (red)' },
						{ id: 'blank', label: 'Blank (yellow)' },
					],
				},
			],
			callback: (fb) => !!(st().cue && st().cue[fb.options.light]),
		},
		source_connected: {
			type: 'boolean',
			name: 'Source is connected',
			defaultStyle: { bgcolor: GREEN, color: WHITE },
			options: [
				{
					type: 'dropdown',
					id: 'source',
					label: 'Source',
					default: 'limitimer',
					choices: [
						{ id: 'limitimer', label: 'Limitimer' },
						{ id: 'cue', label: 'PerfectCue' },
					],
				},
			],
			callback: (fb) => {
				const s = st()[fb.options.source]
				return !!(s && s.status && s.status.state === 'connected')
			},
		},
	}
}

module.exports = { getFeedbacks, colors: { GREEN, YELLOW, RED, BLUE, WHITE, BLACK } }

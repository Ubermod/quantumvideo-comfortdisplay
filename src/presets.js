const { combineRgb } = require('@companion-module/base')
const { colors } = require('./feedbacks')

const DARK = combineRgb(30, 30, 30)
const GREY = combineRgb(60, 60, 60)

function button(category, name, text, actions, feedbacks = [], extra = {}) {
	return {
		type: 'button',
		category,
		name,
		style: { text, size: extra.size || '14', color: colors.WHITE, bgcolor: extra.bgcolor ?? DARK },
		feedbacks,
		steps: [{ down: actions, up: [] }],
	}
}

function getPresets(self) {
	const v = (id) => `$(${self.label}:${id})`
	const p = {}

	// Display
	p.fullscreen_on = button(
		'Display',
		'Go full screen',
		'Go\\nfull screen',
		[{ actionId: 'fullscreen', options: { mode: 'on' } }],
		[{ feedbackId: 'fullscreen', options: {}, style: { bgcolor: colors.GREEN, color: colors.WHITE } }],
	)
	p.fullscreen_off = button('Display', 'Leave full screen', 'Leave\\nfull screen', [
		{ actionId: 'fullscreen', options: { mode: 'off' } },
	])
	p.fullscreen_toggle = button(
		'Display',
		'Full screen (toggle)',
		'Full\\nscreen',
		[{ actionId: 'fullscreen', options: { mode: 'toggle' } }],
		[{ feedbackId: 'fullscreen', options: {}, style: { bgcolor: colors.GREEN, color: colors.WHITE } }],
	)

	// Message
	p.message_show = button(
		'Message',
		'Show message (type the text in the button)',
		'Show\\nmessage',
		[{ actionId: 'message_show', options: { text: 'Please wrap up', blink: 'keep' } }],
		[{ feedbackId: 'message_showing', options: {}, style: { bgcolor: colors.YELLOW, color: colors.BLACK } }],
	)
	p.message_hide = button('Message', 'Hide message', 'Hide\\nmessage', [{ actionId: 'message_hide', options: {} }])
	p.message_toggle = button(
		'Message',
		'Show or hide message (toggle)',
		'Message\\non/off',
		[{ actionId: 'message_toggle', options: { text: '' } }],
		[{ feedbackId: 'message_showing', options: {}, style: { bgcolor: colors.YELLOW, color: colors.BLACK } }],
	)
	p.message_blink = button(
		'Message',
		'Message blink (toggle)',
		'Blink',
		[{ actionId: 'message_blink', options: { mode: 'toggle' } }],
		[{ feedbackId: 'message_blink', options: {}, style: { bgcolor: colors.BLUE, color: colors.WHITE } }],
	)
	p.message_text = button(
		'Message',
		'Current message (shows the text)',
		v('message'),
		[],
		[{ feedbackId: 'message_showing', options: {}, style: { bgcolor: colors.YELLOW, color: colors.BLACK } }],
		{ size: 'auto' },
	)

	// One button per quick message saved in ComfortDisplay
	const quick =
		(self.client && self.client.config && self.client.config.message && self.client.config.message.presets) || []
	quick.forEach((text, i) => {
		p[`quick_${i}`] = button(
			'Quick messages',
			text,
			text,
			[{ actionId: 'message_quick', options: { index: String(i), blink: 'keep' } }],
			[],
			{ size: 'auto' },
		)
	})

	// Timer and cue lights (status buttons; pressing them does nothing)
	p.timer = button(
		'Timer and cues',
		'Timer (live, colored by phase)',
		v('timer'),
		[],
		[
			{ feedbackId: 'timer_phase', options: { phase: 'green' }, style: { bgcolor: colors.GREEN, color: colors.WHITE } },
			{
				feedbackId: 'timer_phase',
				options: { phase: 'yellow' },
				style: { bgcolor: colors.YELLOW, color: colors.BLACK },
			},
			{ feedbackId: 'timer_phase', options: { phase: 'red' }, style: { bgcolor: colors.RED, color: colors.WHITE } },
		],
		{ size: 'auto' },
	)
	p.cue_reverse = button(
		'Timer and cues',
		'Reverse arrow',
		'◀',
		[],
		[{ feedbackId: 'cue_lit', options: { light: 'reverse' }, style: { bgcolor: colors.RED, color: colors.WHITE } }],
		{ size: '44', bgcolor: GREY },
	)
	p.cue_blank = button(
		'Timer and cues',
		'Blank light',
		'●',
		[],
		[{ feedbackId: 'cue_lit', options: { light: 'blank' }, style: { bgcolor: colors.YELLOW, color: colors.BLACK } }],
		{ size: '44', bgcolor: GREY },
	)
	p.cue_forward = button(
		'Timer and cues',
		'Forward arrow',
		'▶',
		[],
		[{ feedbackId: 'cue_lit', options: { light: 'forward' }, style: { bgcolor: colors.GREEN, color: colors.WHITE } }],
		{ size: '44', bgcolor: GREY },
	)

	// Clock
	p.clock = button('Clock', 'Time of day (live)', v('clock'), [], [], { size: 'auto' })
	p.clock_sync = button('Clock', "Set display clock to this computer's time", 'Sync\\nclock', [
		{ actionId: 'clock_sync', options: {} },
	])

	return p
}

module.exports = { getPresets }

// Actions. Each one is a single request to ComfortDisplay's HTTP API.
const BLINK_CHOICES = [
	{ id: 'keep', label: 'Leave as it is' },
	{ id: 'on', label: 'Blink' },
	{ id: 'off', label: "Don't blink" },
]
const ON_OFF_TOGGLE = [
	{ id: 'on', label: 'On' },
	{ id: 'off', label: 'Off' },
	{ id: 'toggle', label: 'Toggle' },
]

function blinkValue(choice) {
	return choice === 'on' ? true : choice === 'off' ? false : undefined
}

function getActions(self) {
	const send = async (method, path, body) => {
		try {
			await self.client.request(method, path, body)
		} catch (e) {
			self.log('warn', `ComfortDisplay command failed (${path}): ${e.message}`)
		}
	}
	const quick = (
		(self.client && self.client.config && self.client.config.message && self.client.config.message.presets) ||
		[]
	).map((text, i) => ({ id: String(i), label: text }))

	return {
		fullscreen: {
			name: 'Full screen',
			description: 'Go full screen, leave full screen, or switch between them',
			options: [{ type: 'dropdown', id: 'mode', label: 'Full screen', default: 'on', choices: ON_OFF_TOGGLE }],
			callback: async (action) => send('POST', `/api/fullscreen/${action.options.mode}`),
		},
		message_show: {
			name: 'Show message',
			description:
				'Show a message on the display. Leave the text empty to show the message already typed in ComfortDisplay.',
			options: [
				{
					type: 'textinput',
					id: 'text',
					label: 'Message (variables allowed; leave empty to keep the current text)',
					default: '',
					useVariables: true,
					multiline: true,
				},
				{ type: 'dropdown', id: 'blink', label: 'Blink', default: 'keep', choices: BLINK_CHOICES },
			],
			callback: async (action, context) => {
				const body = { show: true }
				const text = await context.parseVariablesInString(String(action.options.text ?? ''))
				if (text !== '') body.text = text
				const blink = blinkValue(action.options.blink)
				if (blink !== undefined) body.blink = blink
				await send('POST', '/api/message', body)
			},
		},
		message_hide: {
			name: 'Hide message',
			options: [],
			callback: async () => send('POST', '/api/message', { show: false }),
		},
		message_toggle: {
			name: 'Show or hide message (toggle)',
			description: 'Shows the message if it is hidden, hides it if it is showing',
			options: [
				{
					type: 'textinput',
					id: 'text',
					label: 'Message when showing (variables allowed; leave empty to keep the current text)',
					default: '',
					useVariables: true,
					multiline: true,
				},
			],
			callback: async (action, context) => {
				const showing = !!(self.client.config && self.client.config.message && self.client.config.message.showing)
				const text = await context.parseVariablesInString(String(action.options.text ?? ''))
				const body = { show: !showing }
				if (!showing && text !== '') body.text = text
				await send('POST', '/api/message', body)
			},
		},
		message_set: {
			name: 'Set message text (without showing it)',
			description: 'Changes the message text. If the message is already showing, the new text appears straight away.',
			options: [
				{
					type: 'textinput',
					id: 'text',
					label: 'Message (variables allowed)',
					default: '',
					useVariables: true,
					multiline: true,
				},
			],
			callback: async (action, context) => {
				const text = await context.parseVariablesInString(String(action.options.text ?? ''))
				await send('POST', '/api/message', { text })
			},
		},
		message_quick: {
			name: 'Show a quick message',
			description: "Shows one of the quick messages saved in ComfortDisplay's Message tab",
			options: [
				{
					type: 'dropdown',
					id: 'index',
					label: 'Quick message',
					default: quick.length ? quick[0].id : '0',
					choices: quick.length
						? quick
						: [{ id: '0', label: '(connect to ComfortDisplay to list its quick messages)' }],
				},
				{ type: 'dropdown', id: 'blink', label: 'Blink', default: 'keep', choices: BLINK_CHOICES },
			],
			callback: async (action) => {
				const list = (self.client.config && self.client.config.message && self.client.config.message.presets) || []
				const text = list[Number(action.options.index)]
				if (text === undefined) {
					self.log('warn', 'That quick message no longer exists in ComfortDisplay')
					return
				}
				const body = { show: true, text }
				const blink = blinkValue(action.options.blink)
				if (blink !== undefined) body.blink = blink
				await send('POST', '/api/message', body)
			},
		},
		message_blink: {
			name: 'Message blink',
			options: [{ type: 'dropdown', id: 'mode', label: 'Blink', default: 'toggle', choices: ON_OFF_TOGGLE }],
			callback: async (action) => send('POST', `/api/message/blink/${action.options.mode}`),
		},
		clock_sync: {
			name: "Set the display's clock to this computer's time",
			description: 'Syncs the time of day shown on ComfortDisplay to the computer running Companion',
			options: [],
			callback: async () => {
				// Measure the round trip so network delay doesn't skew the result.
				try {
					const t0 = Date.now()
					const info = await self.client.request('GET', '/api/clock')
					const t1 = Date.now()
					await self.client.request('POST', '/api/clock/sync', { offsetMs: Math.round((t0 + t1) / 2 - info.serverMs) })
				} catch (e) {
					self.log('warn', `Clock sync failed: ${e.message}`)
				}
			},
		},
		clock_reset: {
			name: "Use the display computer's own clock",
			options: [],
			callback: async () => send('POST', '/api/clock/reset'),
		},
	}
}

module.exports = { getActions }

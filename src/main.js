const { InstanceBase, InstanceStatus, Regex, runEntrypoint } = require('@companion-module/base')
const { ComfortDisplayClient } = require('./client')
const { getActions } = require('./actions')
const { getFeedbacks } = require('./feedbacks')
const { getPresets } = require('./presets')
const { VARIABLES, computeValues } = require('./variables')
const UpgradeScripts = require('./upgrades')

class ComfortDisplayInstance extends InstanceBase {
	async init(config) {
		this.config = config
		this.values = {}
		this.quickKey = null
		this.setVariableDefinitions(VARIABLES)
		this.connect()
		this.setActionDefinitions(getActions(this))
		this.setFeedbackDefinitions(getFeedbacks(this))
		this.setPresetDefinitions(getPresets(this))
	}

	async destroy() {
		if (this.client) this.client.stop()
	}

	async configUpdated(config) {
		this.config = config
		this.connect()
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'ComfortDisplay',
				value:
					'Enter the address of the computer running ComfortDisplay and its web control port (8080 unless you changed it in its Window tab). Use 127.0.0.1 if it runs on this computer.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'IP address or host name',
				width: 8,
				default: '127.0.0.1',
				regex: Regex.HOSTNAME,
			},
			{ type: 'number', id: 'port', label: 'Port', width: 4, default: 8080, min: 1, max: 65535 },
		]
	}

	connect() {
		if (this.client) this.client.stop()
		const host = String((this.config && this.config.host) || '').trim()
		const port = Number(this.config && this.config.port)
		if (!host || !(port > 0 && port < 65536)) {
			this.updateStatus(InstanceStatus.BadConfig, 'Enter the ComfortDisplay address and port')
			return
		}
		this.updateStatus(InstanceStatus.Connecting)
		const client = new ComfortDisplayClient(host, port)
		this.client = client
		client.on('connected', () => {
			this.updateStatus(InstanceStatus.Ok)
			this.log('info', `Connected to ComfortDisplay at ${host}:${port}`)
		})
		client.on('disconnected', (reason) =>
			this.updateStatus(InstanceStatus.ConnectionFailure, reason || 'Not connected'),
		)
		client.on('config', () => {
			this.onQuickMessages()
			this.refresh()
		})
		client.on('state', () => this.refresh())
		client.start()
	}

	// Quick messages saved in ComfortDisplay feed a dropdown and presets, so rebuild those when they change.
	onQuickMessages() {
		const list = (this.client.config && this.client.config.message && this.client.config.message.presets) || []
		const key = JSON.stringify(list)
		if (key === this.quickKey) return
		this.quickKey = key
		this.setActionDefinitions(getActions(this))
		this.setPresetDefinitions(getPresets(this))
	}

	refresh() {
		const next = computeValues(this.client.config, this.client.state)
		const changed = {}
		for (const [k, val] of Object.entries(next)) {
			if (this.values[k] !== val) changed[k] = val
		}
		if (Object.keys(changed).length) {
			this.values = next
			this.setVariableValues(changed)
		}
		this.checkFeedbacks()
	}
}

runEntrypoint(ComfortDisplayInstance, UpgradeScripts)

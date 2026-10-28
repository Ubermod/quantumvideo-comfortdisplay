// Talks to ComfortDisplay: live updates over its WebSocket (/ws), commands over HTTP.
// Falls back to polling the HTTP API if this Node runtime has no built-in WebSocket.
const { EventEmitter } = require('events')

const RECONNECT_MS = 3000
const POLL_MS = 1000
const HTTP_TIMEOUT_MS = 4000

class ComfortDisplayClient extends EventEmitter {
	constructor(host, port) {
		super()
		this.base = `http://${host}:${port}`
		this.wsUrl = `ws://${host}:${port}/ws`
		this.ws = null
		this.timer = null
		this.stopped = false
		this.connected = false
		this.config = null
		this.state = null
	}

	start() {
		this.stopped = false
		if (typeof globalThis.WebSocket === 'function') this.connectWs()
		else this.poll()
	}

	stop() {
		this.stopped = true
		clearTimeout(this.timer)
		if (this.ws) {
			try {
				this.ws.close()
			} catch (e) {
				// ignore
			}
			this.ws = null
		}
	}

	setConnected(on, reason) {
		if (on === this.connected && on) return
		this.connected = on
		this.emit(on ? 'connected' : 'disconnected', reason)
	}

	retry(reason) {
		if (this.stopped) return
		this.setConnected(false, reason)
		clearTimeout(this.timer)
		this.timer = setTimeout(() => this.start(), RECONNECT_MS)
	}

	connectWs() {
		let ws
		try {
			ws = new WebSocket(this.wsUrl)
		} catch (e) {
			return this.retry(e.message)
		}
		this.ws = ws
		ws.addEventListener('open', () => {
			if (this.ws === ws) this.setConnected(true)
		})
		ws.addEventListener('message', (ev) => {
			if (this.ws !== ws) return
			let m
			try {
				m = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString())
			} catch (e) {
				return
			}
			if (m.type === 'config') {
				this.config = m.config
				this.emit('config', m.config)
			} else if (m.type === 'state') {
				this.state = m.state
				this.emit('state', m.state)
			}
		})
		// A refused connection fires only 'error'; a dropped one fires 'close' (sometimes both).
		const lost = () => {
			if (this.ws !== ws) return
			this.ws = null
			try {
				ws.close()
			} catch (e) {
				// ignore
			}
			this.retry(`Can't reach ComfortDisplay at ${this.base}`)
		}
		ws.addEventListener('close', lost)
		ws.addEventListener('error', lost)
	}

	async poll() {
		if (this.stopped) return
		try {
			const [config, state] = await Promise.all([this.request('GET', '/api/config'), this.request('GET', '/api/state')])
			this.setConnected(true)
			this.config = config
			this.state = state
			this.emit('config', config)
			this.emit('state', state)
			clearTimeout(this.timer)
			this.timer = setTimeout(() => this.poll(), POLL_MS)
		} catch (e) {
			this.retry(e.message)
		}
	}

	async request(method, path, body) {
		const res = await fetch(this.base + path, {
			method,
			headers: body ? { 'Content-Type': 'application/json' } : undefined,
			body: body ? JSON.stringify(body) : undefined,
			signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
		})
		const text = await res.text()
		let data = null
		try {
			data = text ? JSON.parse(text) : null
		} catch (e) {
			data = text
		}
		if (!res.ok) throw new Error((data && data.error) || `ComfortDisplay replied ${res.status}`)
		return data
	}
}

module.exports = { ComfortDisplayClient }

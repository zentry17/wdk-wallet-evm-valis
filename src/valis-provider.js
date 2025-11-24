'use strict'

import { ValisClient } from 'valis-client'

export default class ValisProvider {
  constructor (wsUrl, options = {}) {
    this._client = new ValisClient(wsUrl, {
      reconnect: true,
      reconnectInitialDelayMs: 500,
      reconnectMaxDelayMs: 12000,
      requestTimeoutMs: 8000,
      heartbeatIntervalMs: 15000,
      ...options
    })

    this._connectPromise = null
  }

  async _ensureConnected () {
    if (!this._connectPromise) {
      this._connectPromise = this._client.connect()
    }
    await this._connectPromise
  }

  /**
   * Get account info (balance, tx history, etc.)
   * @param {string} address - Ethereum-style address
   * @returns {Promise<any>} Account info
   */
  async getAccountInfo (address) {
    await this._ensureConnected()
    return await this._client.sendCommand(address)
  }

  /**
   * Prepare a transaction
   * @param {Object} transaction
   * @returns {Promise<{Object}>}
   */
  async makeTx (transaction) {
    await this._ensureConnected()

    return await this._client.sendCommand(JSON.stringify(transaction))
  }

  async dispose () {
    await this._client.disconnect()
  }

  get client () {
    return this._client
  }
}

// Copyright 2024 Tether Operations Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict'

import { WalletAccountReadOnly } from '@tetherto/wdk-wallet'

/**
 * @typedef {Object} ValisWalletConfig
 * @property {string} [provider] - The url of the ws.
 */

export default class WalletAccountReadOnlyValis extends WalletAccountReadOnly {
  /**
   * Creates a new read-only wallet account.
   *
   * @param {string} address - The account's address.
   * @param {ValisWalletConfig} [config] - The configuration object.
   */
  constructor (address, config = { }) {
    super(address)

    /**
     * The read-only wallet account configuration.
     *
     * @protected
     * @type {ValisWalletConfig}
     */
    this._config = config

    const { provider } = config

    if (provider) {
      /**
       * An ws provider to interact with a node of the blockchain.
       *
       * @protected
       * @type {Provider | undefined}
       */
      this._provider = typeof provider === 'string'
        ? new ValisProvider(provider)
        : provider
    }
  }

  /**
   * Returns the account's balance.
   *
   * @returns {Object} The balance.
   */
  async getBalance () {
    if (!this._provider) {
      throw new Error('The wallet must be connected to a provider.')
    }

    const address = await this.getAddress()
    return await this._provider.getAccountInfo(address)
  }

  /**
   * Returns an transaction to execute.
   *
   * @protected
   * @param {Object} options - The transfer's options.
   * @returns {Promise<Object>} The  transaction.
   */
  static async _getTransaction (options) {
    if (!this._provider) {
      throw new Error('The wallet must be connected to a provider.')
    }

    const tx = await this._provider.makeTx(options)

    return tx
  }
}

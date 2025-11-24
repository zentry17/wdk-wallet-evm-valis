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

import { verifyMessage, Contract } from 'ethers'

import * as bip39 from 'bip39'

import WalletAccountReadOnlyValis from './wallet-account-read-only-valis.js'

import MemorySafeHDNodeWallet from './memory-safe/hd-node-wallet.js'

/** @typedef {import('ethers').HDNodeWallet} HDNodeWallet */

/** @typedef {import('@tetherto/wdk-wallet').IWalletAccount} IWalletAccount */

/** @typedef {import('@tetherto/wdk-wallet').KeyPair} KeyPair */

/** @typedef {import('./wallet-account-read-only-valis.js').ValisWalletConfig} ValisWalletConfig */

const BIP_44_VALIS_DERIVATION_PATH_PREFIX = "m/44'/60'"

/** @implements {IWalletAccount} */
export default class WalletAccountValis extends WalletAccountReadOnlyValis {
  /**
   * Creates a new evm wallet account.
   *
   * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase.
   * @param {string} path - The BIP-44 derivation path (e.g. "0'/0/0").
   * @param {ValisWalletConfig} [config] - The configuration object.
   */
  constructor (seed, path, config = {}) {
    if (typeof seed === 'string') {
      if (!bip39.validateMnemonic(seed)) {
        throw new Error('The seed phrase is invalid.')
      }

      seed = bip39.mnemonicToSeedSync(seed)
    }

    path = BIP_44_VALIS_DERIVATION_PATH_PREFIX + '/' + path

    const account = MemorySafeHDNodeWallet.fromSeed(seed)
      .derivePath(path)

    super(account.address, config)

    /**
     * The wallet account configuration.
     *
     * @protected
     * @type {ValisWalletConfig}
     */
    this._config = config

    /**
     * The account.
     *
     * @protected
     * @type {HDNodeWallet}
     */
    this._account = account
  }

  /**
   * The derivation path's index of this account.
   *
   * @type {number}
   */
  get index () {
    return this._account.index
  }

  /**
   * The derivation path of this account (see [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)).
   *
   * @type {string}
   */
  get path () {
    return this._account.path
  }

  /**
   * The account's key pair.
   *
   * @type {KeyPair}
   */
  get keyPair () {
    return {
      privateKey: this._account.privateKeyBuffer,
      publicKey: this._account.publicKeyBuffer
    }
  }

  /**
   * Sign a message or hex string
   * @param {string} message - Message or hex string to sign
   * @returns {Promise<string>} Signature WITHOUT 0x prefix, V converted to 0/1
   */
  async sign (message) {
  // Use ethers' signing
    const ethersSignature = await this._account.signMessage(message)

    // Convert to your format: V(27/28)→V(0/1), remove 0x
    return this._convertSignature(ethersSignature)
  }

  /**
 * Verify a message signature
 * @param {string} message
 * @param {string} signature - Your format (no 0x, V=0/1)
 * @returns {Promise<boolean>}
 */
  async verify (message, signature) {
  // Convert your signature back to ethers format for verification
    const ethersSignature = this._restoreSignature(signature)
    const address = await verifyMessage(message, ethersSignature)
    return address.toLowerCase() === this._account.address.toLowerCase()
  }

  /**
 * Send a transaction
 * @returns {Promise<Object>}
 */
  async sendTransaction (txParams) {
    if (!this._provider) {
      throw new Error('The wallet must be connected to a provider.')
    }

    const { signthis, rawhex, ...response } = await this._provider.makeTx({
      sender: await this.getAddress(),
      ...txParams
    })

    if (!signthis || !rawhex) {
      throw new Error('Invalid response from maketx: missing signthis or rawhex')
    }

    const signature = await this.sign(signthis)

    const signedTx = signature + rawhex.substring(130)

    return result = await this._provider.sendCommand(signedTx)
  }

  /**
 * @private
 * @param {string} ethersSignature
 * @returns {string}
 */
  _convertSignature (ethersSignature) {
    const sig = ethersSignature.startsWith('0x')
      ? ethersSignature.substring(2)
      : ethersSignature

    const r = sig.substring(0, 64)
    const s = sig.substring(64, 128)
    const v = parseInt(sig.substring(128, 130), 16)

    const vConverted = v === 27 ? 0 : 1

    return r + s + vConverted.toString()
  }

  /**
 * @private
 * @param {string} yourSignature
 * @returns {string}
 */
  _restoreSignature (yourSignature) {
    const r = yourSignature.substring(0, 64)
    const s = yourSignature.substring(64, 128)
    const v = yourSignature.substring(128)

    const vRestored = v === '0' ? 27 : 28

    return '0x' + r + s + vRestored.toString(16).padStart(2, '0')
  }

  /**
   * Returns a read-only copy of the account.
   *
   * @returns {Promise<WalletAccountReadOnlyValis>} The read-only account.
   */
  async toReadOnlyAccount () {
    const readOnlyAccount = new WalletAccountReadOnlyValis(this._account.address, this._config)

    return readOnlyAccount
  }

  /**
   * Disposes the wallet account, erasing the private key from the memory.
   */
  dispose () {
    this._account.dispose()
  }
}

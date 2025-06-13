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

import { BrowserProvider, Contract, JsonRpcProvider, verifyMessage } from 'ethers'

import * as bip39 from 'bip39'

import MemorySafeHDNodeWallet from './memory-safe/hd-node-wallet.js'

/**
 * @typedef {import("@wdk/wallet").IWalletAccount} IWalletAccount
 */

/**
 * @typedef {import("@wdk/wallet").KeyPair} KeyPair
 */

/**
 * @typedef { import("@wdk/wallet").TransactionResult } TransactionResult
 */

/**
 * @typedef { import("@wdk/wallet").TransferOptions } TransferOptions
 */

/**
 * @typedef { import("@wdk/wallet").TransferResult } TransferResult
 */

/**
 * @typedef {import('ethers').Eip1193Provider} Eip1193Provider
 */

/**
 * @typedef {Object} EvmTransaction
 * @property {string} to - The transaction's recipient.
 * @property {number} value - The amount of ethers to send to the recipient (in weis).
 * @property {string} [data] - The transaction's data in hex format.
 * @property {number} [gasLimit] - The maximum amount of gas this transaction is permitted to use.
 * @property {number} [gasPrice] - The price (in wei) per unit of gas this transaction will pay.
 * @property {number} [maxFeePerGas] - The maximum price (in wei) per unit of gas this transaction will pay for the combined [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) block's base fee and this transaction's priority fee.
 * @property {number} [maxPriorityFeePerGas] - The price (in wei) per unit of gas this transaction will allow in addition to the [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) block's base fee to bribe miners into giving this transaction priority. This is included in the maxFeePerGas, so this will not affect the total maximum cost set with maxFeePerGas.
 */

/**
 * @typedef {Object} EvmWalletConfig
 * @property {string | Eip1193Provider} [provider] - The url of the rpc provider, or an instance of a class that implements eip-1193.
 * @property {number} [transferMaxFee] - The maximum fee amount for transfer operations.
 */

const BIP_44_ETH_DERIVATION_PATH_PREFIX = "m/44'/60'"

/** @implements {IWalletAccount} */
export default class WalletAccountEvm {
  /**
   * Creates a new evm wallet account.
   *
   * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase.
   * @param {string} path - The BIP-44 derivation path (e.g. "0'/0/0").
   * @param {EvmWalletConfig} [config] - The configuration object.
   */
  constructor (seed, path, config = {}) {
    if (typeof seed === 'string') {
      if (!bip39.validateMnemonic(seed)) {
        throw new Error('The seed phrase is invalid.')
      }

      seed = bip39.mnemonicToSeedSync(seed)
    }

    path = BIP_44_ETH_DERIVATION_PATH_PREFIX + '/' + path

    /**
     * The wallet account configuration.
     *
     * @protected
     * @type {EvmWalletConfig}
     */
    this._config = config

    /**
     * The account.
     *
     * @protected
     * @type {MemorySafeHDNodeWallet}
     */
    this._account = MemorySafeHDNodeWallet.fromSeed(seed)
      .derivePath(path)

    let { provider } = config

    if (provider) {
      provider = typeof provider === 'string'
        ? new JsonRpcProvider(provider)
        : new BrowserProvider(provider)

      this._account = this._account.connect(provider)
    }
  }

  get index () {
    return this._account.index
  }

  get path () {
    return this._account.path
  }

  get keyPair () {
    return {
      privateKey: this._account.privateKeyBuffer,
      publicKey: this._account.publicKeyBuffer
    }
  }

  async getAddress () {
    return this._account.address
  }

  async sign (message) {
    return await this._account.signMessage(message)
  }

  async verify (message, signature) {
    const address = await verifyMessage(message, signature)

    return address.toLowerCase() === this._account.address.toLowerCase()
  }

  async getBalance () {
    if (!this._account.provider) {
      throw new Error('The wallet must be connected to a provider to retrieve balances.')
    }

    const balance = await this._account.provider.getBalance(await this.getAddress())

    return Number(balance)
  }

  async getTokenBalance (tokenAddress) {
    if (!this._account.provider) {
      throw new Error('The wallet must be connected to a provider to retrieve token balances.')
    }

    const abi = ['function balanceOf(address owner) view returns (uint256)']
    const token = new Contract(tokenAddress, abi, this._account.provider)
    const balance = await token.balanceOf(await this.getAddress())

    return Number(balance)
  }

  /**
   * Sends a transaction with arbitrary data.
   *
   * @param {EvmTransaction} tx - The transaction to send.
   * @returns {Promise<TransactionResult>} The transaction's result.
   */
  async sendTransaction (tx) {
    if (!this._account.provider) {
      throw new Error('The wallet must be connected to a provider to send transactions.')
    }

    const transaction = await this._account.sendTransaction(tx)

    const { hash, fee } = await transaction.wait()

    return {
      hash,
      fee: Number(fee)
    }
  }

  /**
   * Quotes a transaction.
   *
   * @param {EvmTransaction} tx - The transaction to quote.
   * @returns {Promise<Omit<TransactionResult, "hash">>} The transaction's quotes (in weis).
   */
  async quoteSendTransaction (tx) {
    if (!this._account.provider) {
      throw new Error('The wallet must be connected to a provider to quote transactions.')
    }

    const gasLimit = await this._account.provider.estimateGas(tx)

    const { maxFeePerGas } = await this._account.provider.getFeeData()

    return { fee: Number(gasLimit * maxFeePerGas) }
  }

  async transfer (options) {
    if (!this._account.provider) {
      throw new Error('The wallet must be connected to a provider to transfer tokens.')
    }

    const { token, recipient, amount, simulate } = options

    const abi = [
      'function transfer(address to, uint256 amount) returns (bool)'
    ]

    const tokenContract = new Contract(token, abi, this._account)
    const data = tokenContract.interface.encodeFunctionData('transfer', [recipient, amount])

    const tx = {
      to: token,
      data
    }

    const { fee } = await this.quoteSendTransaction(tx)

    if (this._config.transferMaxFee && fee >= this._config.transferMaxFee) {
      throw new Error('Exceeded maximum fee cost for transfer.')
    }

    if (simulate) {
      return { fee }
    }

    const txRes = this.sendTransaction(tx)

    return txRes
  }

  async quoteTransfer (options) {
    return this.transfer({ ...options, simulate: true })
  }

  dispose () {
    this._account.dispose()
  }
}

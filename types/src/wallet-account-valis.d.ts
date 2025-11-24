/** @implements {IWalletAccount} */
export default class WalletAccountValis extends WalletAccountReadOnlyValis implements IWalletAccount {
    /**
     * Creates a new evm wallet account.
     *
     * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase.
     * @param {string} path - The BIP-44 derivation path (e.g. "0'/0/0").
     * @param {ValisWalletConfig} [config] - The configuration object.
     */
    constructor(seed: string | Uint8Array, path: string, config?: ValisWalletConfig);
    /**
     * The account.
     *
     * @protected
     * @type {HDNodeWallet}
     */
    protected _account: HDNodeWallet;
    /**
     * The derivation path's index of this account.
     *
     * @type {number}
     */
    get index(): number;
    /**
     * The derivation path of this account (see [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)).
     *
     * @type {string}
     */
    get path(): string;
    /**
     * The account's key pair.
     *
     * @type {KeyPair}
     */
    get keyPair(): KeyPair;
    /**
     * Sign a message or hex string
     * @param {string} message - Message or hex string to sign
     * @returns {Promise<string>} Signature WITHOUT 0x prefix, V converted to 0/1
     */
    sign(message: string): Promise<string>;
    /**
   * Verify a message signature
   * @param {string} message
   * @param {string} signature - Your format (no 0x, V=0/1)
   * @returns {Promise<boolean>}
   */
    verify(message: string, signature: string): Promise<boolean>;
    /**
   * Send a transaction
   * @returns {Promise<Object>}
   */
    sendTransaction(txParams: any): Promise<any>;
    /**
   * @private
   * @param {string} ethersSignature
   * @returns {string}
   */
    private _convertSignature;
    /**
   * @private
   * @param {string} yourSignature
   * @returns {string}
   */
    private _restoreSignature;
    /**
     * Returns a read-only copy of the account.
     *
     * @returns {Promise<WalletAccountReadOnlyValis>} The read-only account.
     */
    toReadOnlyAccount(): Promise<WalletAccountReadOnlyValis>;
    /**
     * Disposes the wallet account, erasing the private key from the memory.
     */
    dispose(): void;
}
export type HDNodeWallet = import("ethers").HDNodeWallet;
export type IWalletAccount = import("@tetherto/wdk-wallet").IWalletAccount;
export type KeyPair = import("@tetherto/wdk-wallet").KeyPair;
export type ValisWalletConfig = import("./wallet-account-read-only-valis.js").ValisWalletConfig;
import WalletAccountReadOnlyValis from './wallet-account-read-only-valis.js';

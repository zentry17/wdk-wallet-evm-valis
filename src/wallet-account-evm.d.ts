/** @implements {IWalletAccount} */
export default class WalletAccountEvm implements IWalletAccount {
    /**
     * Creates a new evm wallet account.
     *
     * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase.
     * @param {string} path - The BIP-44 derivation path (e.g. "0'/0/0").
     * @param {EvmWalletConfig} [config] - The configuration object.
     */
    constructor(seed: string | Uint8Array, path: string, config?: EvmWalletConfig);
    /**
     * The wallet account configuration.
     *
     * @protected
     * @type {EvmWalletConfig}
     */
    protected _config: EvmWalletConfig;
    /**
     * The account.
     *
     * @protected
     * @type {MemorySafeHDNodeWallet}
     */
    protected _account: MemorySafeHDNodeWallet;
    get index(): any;
    get path(): any;
    get keyPair(): {
        privateKey: any;
        publicKey: any;
    };
    getAddress(): Promise<any>;
    sign(message: any): Promise<any>;
    verify(message: any, signature: any): Promise<boolean>;
    getBalance(): Promise<number>;
    getTokenBalance(tokenAddress: any): Promise<number>;
    /**
     * Sends a transaction with arbitrary data.
     *
     * @param {EvmTransaction} tx - The transaction to send.
     * @returns {Promise<TransactionResult>} The transaction's result.
     */
    sendTransaction(tx: EvmTransaction): Promise<TransactionResult>;
    /**
     * Quotes a transaction.
     *
     * @param {EvmTransaction} tx - The transaction to quote.
     * @returns {Promise<Omit<TransactionResult, "hash">>} The transaction's quotes (in weis).
     */
    quoteSendTransaction(tx: EvmTransaction): Promise<Omit<TransactionResult, "hash">>;
    transfer(options: any): Promise<any>;
    quoteTransfer(options: any): Promise<any>;
    dispose(): void;
}
export type IWalletAccount = any;
export type KeyPair = import("@wdk/wallet").KeyPair;
export type TransactionResult = import("@wdk/wallet").TransactionResult;
export type TransferOptions = import("@wdk/wallet").TransferOptions;
export type TransferResult = import("@wdk/wallet").TransferResult;
export type Eip1193Provider = import("ethers").Eip1193Provider;
export type EvmTransaction = {
    /**
     * - The transaction's recipient.
     */
    to: string;
    /**
     * - The amount of ethers to send to the recipient (in weis).
     */
    value: number;
    /**
     * - The transaction's data in hex format.
     */
    data?: string;
    /**
     * - The maximum amount of gas this transaction is permitted to use.
     */
    gasLimit?: number;
    /**
     * - The price (in wei) per unit of gas this transaction will pay.
     */
    gasPrice?: number;
    /**
     * - The maximum price (in wei) per unit of gas this transaction will pay for the combined [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) block's base fee and this transaction's priority fee.
     */
    maxFeePerGas?: number;
    /**
     * - The price (in wei) per unit of gas this transaction will allow in addition to the [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) block's base fee to bribe miners into giving this transaction priority. This is included in the maxFeePerGas, so this will not affect the total maximum cost set with maxFeePerGas.
     */
    maxPriorityFeePerGas?: number;
};
export type EvmWalletConfig = {
    /**
     * - The url of the rpc provider, or an instance of a class that implements eip-1193.
     */
    provider?: string | Eip1193Provider;
    /**
     * - The maximum fee amount for transfer operations.
     */
    transferMaxFee?: number;
};

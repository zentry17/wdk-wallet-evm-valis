/**
 * @typedef {Object} ValisWalletConfig
 * @property {string} [provider] - The url of the ws.
 */
export default class WalletAccountReadOnlyValis extends WalletAccountReadOnly {
    /**
     * Returns an transaction to execute.
     *
     * @protected
     * @param {Object} options - The transfer's options.
     * @returns {Promise<Object>} The  transaction.
     */
    protected static _getTransaction(options: any): Promise<any>;
    /**
     * Creates a new read-only wallet account.
     *
     * @param {string} address - The account's address.
     * @param {ValisWalletConfig} [config] - The configuration object.
     */
    constructor(address: string, config?: ValisWalletConfig);
    /**
     * The read-only wallet account configuration.
     *
     * @protected
     * @type {ValisWalletConfig}
     */
    protected _config: ValisWalletConfig;
    /**
     * An ws provider to interact with a node of the blockchain.
     *
     * @protected
     * @type {Provider | undefined}
     */
    protected _provider: Provider | undefined;
    /**
     * Returns the account's balance.
     *
     * @returns {Object} The balance.
     */
    getBalance(): any;
}
export type ValisWalletConfig = {
    /**
     * - The url of the ws.
     */
    provider?: string;
};
import { WalletAccountReadOnly } from '@tetherto/wdk-wallet';

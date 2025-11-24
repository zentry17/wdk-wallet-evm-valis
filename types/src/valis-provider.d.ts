export default class ValisProvider {
    constructor(wsUrl: any, options?: {});
    _client: ValisClient;
    _connectPromise: Promise<void>;
    _ensureConnected(): Promise<void>;
    /**
     * Get account info (balance, tx history, etc.)
     * @param {string} address - Ethereum-style address
     * @returns {Promise<any>} Account info
     */
    getAccountInfo(address: string): Promise<any>;
    /**
     * Prepare a transaction
     * @param {Object} transaction
     * @returns {Promise<{Object}>}
     */
    makeTx(transaction: any): Promise<{
        Object: any;
    }>;
    dispose(): Promise<void>;
    get client(): ValisClient;
}
import { ValisClient } from 'valis-client';

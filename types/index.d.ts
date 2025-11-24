export { default } from "./src/wallet-manager-valis.js";
export { default as WalletAccountReadOnlyValis } from "./src/wallet-account-read-only-valis.js";
export { default as WalletAccountValis } from "./src/wallet-account-valis.js";
export type KeyPair = import("@tetherto/wdk-wallet").KeyPair;
export type ValisWalletConfig = import("./src/wallet-account-read-only-valis.js").ValisWalletConfig;

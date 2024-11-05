/// <reference types="vite/client" />

declare global {
    interface Window {
        ethereum?: import('ethers').providers.ExternalProvider;
    }
}


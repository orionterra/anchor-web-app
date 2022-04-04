import { EvmChainId } from '@anchor-protocol/crossanchor-sdk';
import { ethers } from 'ethers';
import { Connection } from './types';

export const availableConnections: Connection[] = [
  {
    name: 'MetaMask',
    type: 'METAMASK',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  },
  {
    name: 'WalletConnect',
    type: 'WALLETCONNECT',
    icon: 'https://assets.terra.money/icon/wallet-provider/walletconnect.svg',
  },
];

export const availableConnectTypes = ['METAMASK', 'WALLETCONNECT'] as const;

type ChainConfiguration = {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
};

export const chainConfigurations: { [K in EvmChainId]?: ChainConfiguration } = {
  [EvmChainId.AVALANCHE_FUJI_TESTNET]: {
    chainId: ethers.utils.hexValue(EvmChainId.AVALANCHE_FUJI_TESTNET),
    chainName: 'Avalanche Fuji Testnet',
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    blockExplorerUrls: ['https://cchain.explorer.avax-test.network'],
  },
};

export const supportedChainId = [
  // EvmChainId.ETHEREUM,
  // EvmChainId.ETHEREUM_ROPSTEN,
  EvmChainId.AVALANCHE,
  EvmChainId.AVALANCHE_FUJI_TESTNET,
] as const;

export const supportedChainsRps: Record<
  typeof supportedChainId[number],
  string
> = {
  [EvmChainId.AVALANCHE]: 'https://api.avax.network/ext/bc/C/rpc',
  [EvmChainId.AVALANCHE_FUJI_TESTNET]:
    'https://api.avax-test.network/ext/bc/C/rpc',
};

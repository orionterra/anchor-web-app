import React from 'react';
import {
  ConnectType,
  EvmWalletProvider,
  getDefaultEvmChainId,
  SupportedChainIds,
  useEvmWallet,
} from '@libs/evm-wallet';
import { UIElementProps } from '@libs/ui';
import { AppProviders } from 'configurations/app';
import { EvmAccountProvider } from './EvmAccountProvider';
import { EvmBalancesProvider } from './EvmBalancesProvider';
import { EvmNetworkProvider } from './EvmNetworkProvider';
import { ThemeProvider } from 'contexts/theme';
import { lightTheme as ethereumLightTheme } from 'themes/ethereum/lightTheme';
import { lightTheme as avalancheLightTheme } from 'themes/avalanche/lightTheme';
import { Chain, useDeploymentTarget } from '@anchor-protocol/app-provider';
import { QueryProvider } from 'providers/QueryProvider';
import { EvmUnsupportedNetwork } from 'components/EvmUnsupportedNetwork';
import { GlobalStyle } from '@libs/neumorphism-ui/themes/GlobalStyle';
import { BackgroundTxRequestProvider } from 'tx/evm/background';
import { EvmChainId } from '@anchor-protocol/crossanchor-sdk';
import { EvmWrongNetwork } from 'components/EvmWrongNetwork';

const isSupportedChain = (evmChainId?: EvmChainId): boolean => {
  return Boolean(evmChainId) && SupportedChainIds.includes(evmChainId!);
};

const ChainGaurdian = (props: UIElementProps) => {
  const { children } = props;

  const {
    target: { chain },
  } = useDeploymentTarget();

  const { chainId, connectType } = useEvmWallet();

  const showUnsupportedNetwork =
    chainId !== undefined && isSupportedChain(chainId) === false;

  if (showUnsupportedNetwork) {
    return (
      <>
        <GlobalStyle />
        <EvmUnsupportedNetwork />
      </>
    );
  }

  const destinationChainId = getDefaultEvmChainId(chain);

  const showWrongNetwork =
    chainId !== undefined &&
    connectType !== ConnectType.None &&
    chainId !== destinationChainId;

  if (showWrongNetwork) {
    return (
      <>
        <GlobalStyle />
        <EvmWrongNetwork
          chain={chain}
          connectionType={connectType}
          chainId={destinationChainId}
        />
      </>
    );
  }

  return (
    <EvmNetworkProvider>
      <QueryProvider>
        <EvmAccountProvider>
          <AppProviders>
            <BackgroundTxRequestProvider>
              <EvmBalancesProvider>{children}</EvmBalancesProvider>
            </BackgroundTxRequestProvider>
          </AppProviders>
        </EvmAccountProvider>
      </QueryProvider>
    </EvmNetworkProvider>
  );
};

export function EvmAppProviders({ children }: UIElementProps) {
  const { target } = useDeploymentTarget();

  return (
    <EvmWalletProvider>
      <ThemeProvider
        initialTheme="light"
        lightTheme={
          target.chain === Chain.Ethereum
            ? ethereumLightTheme
            : avalancheLightTheme
        }
      >
        <ChainGaurdian>{children}</ChainGaurdian>
      </ThemeProvider>
    </EvmWalletProvider>
  );
}

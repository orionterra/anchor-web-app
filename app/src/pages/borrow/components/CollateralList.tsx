import { computeLiquidationPrice } from '@anchor-protocol/app-fns';
import {
  useBorrowBorrowerQuery,
  useBorrowMarketQuery,
} from '@anchor-protocol/app-provider';
import { useFormatters } from '@anchor-protocol/formatter/useFormatters';
import { formatBAsset } from '@anchor-protocol/notation';
import { TokenIcon } from '@anchor-protocol/token-icons';
import { bAsset, CW20Addr, ERC20Addr, u, UST } from '@anchor-protocol/types';
import { demicrofy as demicrofybAsset } from '@libs/formatter';
import { BorderButton } from '@libs/neumorphism-ui/components/BorderButton';
import { HorizontalScrollTable } from '@libs/neumorphism-ui/components/HorizontalScrollTable';
import { IconSpan } from '@libs/neumorphism-ui/components/IconSpan';
import { InfoTooltip } from '@libs/neumorphism-ui/components/InfoTooltip';
import { Section } from '@libs/neumorphism-ui/components/Section';
import { Launch } from '@material-ui/icons';
import big, { Big, BigSource } from 'big.js';
import { BuyLink } from 'components/BuyButton';
import { useAccount } from 'contexts/account';
import { useBridgeAssetsQuery } from 'queries/bridge/useBridgeAssetsQuery';
import React, { ReactNode, useMemo } from 'react';
import { useProvideCollateralDialog } from './useProvideCollateralDialog';
import { useRedeemCollateralDialog } from './useRedeemCollateralDialog';

export interface CollateralListProps {
  className?: string;
}

interface CollateralInfo {
  icon: ReactNode;
  collateralToken: CW20Addr;
  token: CW20Addr | ERC20Addr;
  name: string;
  symbol: string;
  price: UST;
  liquidationPrice: UST | undefined;
  lockedAmount: u<bAsset>;
  lockedAmountInUST: u<UST<BigSource>>;
}

export function CollateralList({ className }: CollateralListProps) {
  const { connected } = useAccount();

  const { data: borrowMarket } = useBorrowMarketQuery();

  const { data: borrowBorrower } = useBorrowBorrowerQuery();

  const [openProvideCollateralDialog, provideCollateralDialogElement] =
    useProvideCollateralDialog();

  const [openRedeemCollateralDialog, redeemCollateralDialogElement] =
    useRedeemCollateralDialog();

  const { data: bridgeAssets } = useBridgeAssetsQuery(
    borrowMarket?.overseerWhitelist.elems,
  );

  const {
    ust: { formatOutput, demicrofy },
  } = useFormatters();

  const collaterals = useMemo<CollateralInfo[]>(() => {
    if (!borrowMarket || !bridgeAssets) {
      return [];
    }

    const whiltelist = borrowMarket.overseerWhitelist.elems.filter((elem) => {
      return bridgeAssets.has(elem.collateral_token);
    });

    return whiltelist.map(
      ({ collateral_token, name, symbol, tokenDisplay }) => {
        const oracle = borrowMarket.oraclePrices.prices.find(
          ({ asset }) => collateral_token === asset,
        );
        const collateral = borrowBorrower?.overseerCollaterals.collaterals.find(
          ([collateralToken]) => collateral_token === collateralToken,
        );

        return {
          icon: (
            <TokenIcon
              token={symbol.toLowerCase() === 'beth' ? 'beth' : 'bluna'}
            />
          ),
          collateralToken: collateral_token,
          token: bridgeAssets.get(collateral_token)!,
          name,
          symbol: tokenDisplay?.symbol ?? symbol,
          price: oracle?.price ?? ('0' as UST),
          liquidationPrice:
            borrowBorrower &&
            borrowBorrower.overseerCollaterals.collaterals.length === 1 &&
            collateral
              ? computeLiquidationPrice(
                  collateral_token,
                  borrowBorrower.marketBorrowerInfo,
                  borrowBorrower.overseerBorrowLimit,
                  borrowBorrower.overseerCollaterals,
                  borrowMarket.overseerWhitelist,
                  borrowMarket.oraclePrices,
                )
              : undefined,
          lockedAmount: collateral?.[1] ?? ('0' as u<bAsset>),
          lockedAmountInUST: big(collateral?.[1] ?? 0).mul(
            oracle?.price ?? 1,
          ) as u<UST<Big>>,
        };
      },
    );
  }, [borrowBorrower, borrowMarket, bridgeAssets]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return (
    <Section className={className}>
      <HorizontalScrollTable minWidth={850}>
        <colgroup>
          <col style={{ width: 200 }} />
          <col style={{ width: 200 }} />
          <col style={{ width: 200 }} />
          <col style={{ width: 250 }} />
        </colgroup>
        <thead>
          <tr>
            <th>COLLATERAL LIST</th>
            <th>
              <IconSpan>
                Price{' '}
                <InfoTooltip>
                  Current price of bAsset / Price of bAsset that will trigger
                  liquidation of current loan
                </InfoTooltip>
              </IconSpan>
            </th>
            <th>
              <IconSpan>
                Provided{' '}
                <InfoTooltip>
                  Value of bAsset collateral deposited by user / Amount of
                  bAsset collateral deposited by user
                </InfoTooltip>
              </IconSpan>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {collaterals.map(
            ({
              collateralToken,
              token,
              icon,
              name,
              symbol,
              price,
              liquidationPrice,
              lockedAmount,
              lockedAmountInUST,
            }) => (
              <tr key={collateralToken}>
                <td>
                  <i>{icon}</i>
                  <div>
                    <div className="coin">
                      {symbol}{' '}
                      {symbol === 'bETH' && (
                        <BuyLink
                          href="https://anchor.lido.fi/"
                          target="_blank"
                          rel="noreferrer"
                          style={{ transform: 'translateY(-5px)' }}
                        >
                          GET <Launch />
                        </BuyLink>
                      )}
                    </div>
                    <p className="name">{name}</p>
                  </div>
                </td>
                <td>
                  <div className="value">{formatOutput(price)} UST</div>
                  <p className="volatility">
                    {Boolean(Number(liquidationPrice)) &&
                      formatOutput(liquidationPrice!) + ' UST'}
                  </p>
                </td>
                <td>
                  <div className="value">
                    {formatBAsset(demicrofybAsset(lockedAmount))} {symbol}
                  </div>
                  <p className="volatility">
                    {formatOutput(demicrofy(lockedAmountInUST))} UST
                  </p>
                </td>
                <td>
                  <BorderButton
                    disabled={!connected || !borrowMarket || !borrowBorrower}
                    onClick={() =>
                      borrowMarket &&
                      borrowBorrower &&
                      openProvideCollateralDialog({
                        collateralToken,
                        token,
                        fallbackBorrowMarket: borrowMarket,
                        fallbackBorrowBorrower: borrowBorrower,
                      })
                    }
                  >
                    Provide
                  </BorderButton>
                  <BorderButton
                    disabled={
                      !connected ||
                      !borrowMarket ||
                      !borrowBorrower ||
                      big(lockedAmount).lte(0)
                    }
                    onClick={() =>
                      borrowMarket &&
                      borrowBorrower &&
                      openRedeemCollateralDialog({
                        collateralToken,
                        token,
                        fallbackBorrowMarket: borrowMarket,
                        fallbackBorrowBorrower: borrowBorrower,
                      })
                    }
                  >
                    Withdraw
                  </BorderButton>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </HorizontalScrollTable>

      {provideCollateralDialogElement}
      {redeemCollateralDialogElement}
    </Section>
  );
}

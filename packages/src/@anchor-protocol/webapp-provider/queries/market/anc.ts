import { MarketAncData, marketAncQuery } from '@anchor-protocol/webapp-fns';
import { createQueryFn } from '@terra-dev/react-query-utils';
import { useBrowserInactive } from '@terra-dev/use-browser-inactive';
import { useTerraWebapp } from '@terra-money/webapp-provider';
import { useQuery, UseQueryResult } from 'react-query';
import { ANCHOR_QUERY_KEY } from '../../env';

const queryFn = createQueryFn((endpoint: string) => {
  return marketAncQuery({ endpoint });
});

export function useMarketAncQuery(): UseQueryResult<MarketAncData | undefined> {
  const { queryErrorReporter } = useTerraWebapp();

  const { browserInactive } = useBrowserInactive();

  const result = useQuery(
    [ANCHOR_QUERY_KEY.MARKET_ANC, 'https://anchor-services.vercel.app'],
    queryFn,
    {
      refetchInterval: browserInactive && 1000 * 60 * 5,
      enabled: !browserInactive,
      keepPreviousData: true,
      onError: queryErrorReporter,
    },
  );

  return result;
}
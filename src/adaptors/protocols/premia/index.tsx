import BigNumber from 'bignumber.js'
import {
  Direction,
  OptionType,
  Protocols,
  SupportedNetworks,
  UnderlyingAsset,
  WETH,
  DAI,
  findLinkedAssetByAddress,
} from '../../../constants'
import { Position } from '../../../types'
import { toTokenAmount } from '../../../utils/math'
import { Adaptor } from '../../interface'
import { querySubgraph } from '../../utils'
import { getAccountTokensQuery, premiaSupportedNetworks, networkToSubgraphEndpoint } from './constants'
import { UserOwnedTokenType } from './types'

export class PremiaAdaptor implements Adaptor {
  async getPositionsByUnderlying(account: string, underlying: UnderlyingAsset): Promise<Position[]> {
    let result: Position[] = []
    for (const network of premiaSupportedNetworks) {
      const endpoint = networkToSubgraphEndpoint(network) as string

      const userOwnedOptions = (await querySubgraph(endpoint, getAccountTokensQuery(account.toLowerCase())))[
        'userOwnedOptions'
      ] as UserOwnedTokenType[]

      const positionOnThisNetwork = userOwnedOptions
        .filter(p => findLinkedAssetByAddress(p.option.underlying.id, network) === underlying)
        .map(p => this.toPosition(p, network))

      result = result.concat(positionOnThisNetwork)
    }
    return result
  }

  toPosition(position: UserOwnedTokenType, network: SupportedNetworks): Position {
    return {
      id: position.id,
      chainId: network,
      protocol: Protocols.Premia,
      strikePrice: toTokenAmount(position.option.strike, 18),
      expiry: Number(position.option.maturity),
      type: position.option.optionType === 'PUT' ? OptionType.Put : OptionType.Call, // call or put
      direction: Direction.Long, // always long
      amount: toTokenAmount(position.size, 18),
      strike: DAI, // dai
      collateral: undefined,
      underlying: WETH,
      collateralAmount: new BigNumber(0),
    }
  }
}

export default PremiaAdaptor

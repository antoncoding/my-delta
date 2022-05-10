import BigNumber from 'bignumber.js'
import { Direction, OptionType, Protocols, SupportedNetworks, UnderlyingAsset, USDC, sETH } from '../../../constants'
import { Position } from '../../../types'
import { Adaptor } from '../../interface'
// import Lyra, {Position as LyraPosition}  from '@lyrafinance/lyra-js'
// const lyra = new Lyra()

export class LyraAdaptor implements Adaptor {
  async getPositionsByUnderlying(account: string, underlying: UnderlyingAsset): Promise<Position[]> {
    return [
      {
        id: '',
        chainId: SupportedNetworks.Optimism,
        protocol: Protocols.Lyra,
        strikePrice: new BigNumber(5500),
        expiry: 1669878000,
        type: OptionType.Call, // call or put
        direction: Direction.Long, // long or short
        amount: new BigNumber(10),
        strike: USDC,
        collateral: sETH,
        underlying: sETH,
        collateralAmount: new BigNumber(0),
      },
      {
        id: '',
        chainId: SupportedNetworks.Optimism,
        protocol: Protocols.Lyra,
        strikePrice: new BigNumber(2000),
        expiry: 1669878000,
        type: OptionType.Put, // call or put
        direction: Direction.Short, // long or short
        amount: new BigNumber(5),
        strike: USDC,
        collateral: USDC,
        underlying: sETH,
        collateralAmount: new BigNumber(3000e6),
      },
    ]
  }

  async getAllPositions(account: string): Promise<Position[]> {
    const positions = [] // await lyra.positions(account)
    return positions.map(p => this.toPosition(p))
  }

  toPosition(p: any): Position {
    return {
      id: '',
      chainId: SupportedNetworks.Optimism,
      protocol: Protocols.Lyra,
      strikePrice: new BigNumber(5500),
      expiry: 1669878000,
      type: OptionType.Call, // call or put
      direction: Direction.Long, // long or short
      amount: new BigNumber(10),
      strike: USDC,
      collateral: sETH,
      underlying: sETH,
      collateralAmount: new BigNumber(0),
    }
  }
}

export default LyraAdaptor

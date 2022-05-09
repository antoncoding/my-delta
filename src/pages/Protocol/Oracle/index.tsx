import React, { useState, useEffect, useMemo } from 'react'
import ReactGA from 'react-ga'
import { DataView, DropDown, Tag, Help } from '@aragon/ui'
import BigNumber from 'bignumber.js'
import LabelText from '../../../components/LabelText'
import CustomIdentityBadge from '../../../components/CustomIdentityBadge'

import { expiryToDate, toTokenAmount } from '../../../utils/math'
import Header from '../../../components/Header'
import SectionTitle from '../../../components/SectionHeader'
import StyledContainer from '../../../components/StyledContainer'

import { SubgraphPriceEntry } from '../../../types'
import { pricerMap } from './config'
import { ZERO_ADDR } from '../../../constants/addresses'
import { PRICE_SUBMISSION } from '../../../constants/dataviewContents'
import { useExpiryPriceData } from '../../../hooks/useExpiryPriceData'

export default function Oracle() {
  useEffect(() => {
    ReactGA.pageview('/protocol/oracle/')
  }, [])

  const [selectedAssetIndex, setSelectedAssetIndex] = useState(-1)
  const [assetHistory, setAssetHistory] = useState<SubgraphPriceEntry[]>([])

  const { allOracleAssets, isLoading } = useExpiryPriceData()

  const haveValidSelection = useMemo(
    () => allOracleAssets.length > 0 && selectedAssetIndex !== -1,
    [allOracleAssets, selectedAssetIndex],
  )

  // update ths history array
  useEffect(() => {
    if (!haveValidSelection) return
    setAssetHistory(allOracleAssets[selectedAssetIndex].prices)
  }, [selectedAssetIndex, allOracleAssets, haveValidSelection])

  return (
    <StyledContainer>
      <Header primary="Oracle" />
      In Opyn v2, we need on-chain prices for underlying assets to settle oTokens.
      <SectionTitle title="Choose an Asset" />
      <DropDown
        disabled={!allOracleAssets || allOracleAssets.length === 0}
        items={allOracleAssets ? allOracleAssets.map(p => p.asset.symbol) : []}
        selected={selectedAssetIndex}
        onChange={setSelectedAssetIndex}
      />
      <SectionTitle title="Asset Detail" />
      <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '3%' }}>
        <div style={{ width: '30%' }}>
          <LabelText label="Pricer" />
          <CustomIdentityBadge
            label={haveValidSelection ? pricerMap[allOracleAssets[selectedAssetIndex].asset.symbol] : 'Unknown'}
            entity={haveValidSelection ? allOracleAssets[selectedAssetIndex].pricer.id : ZERO_ADDR}
          />
        </div>

        <div style={{ width: '30%' }}>
          <div style={{ display: 'flex' }}>
            <LabelText label="Locking Period" />
            <Help hint={'What is locking period'}>
              Period of time after expiry that price submission will not be accepted.
            </Help>
          </div>
          <div style={{ paddingTop: '3%' }}>
            {haveValidSelection ? Number(allOracleAssets[selectedAssetIndex].pricer.lockingPeriod) / 60 : 0} Minutes
          </div>
        </div>

        <div style={{ width: '30%' }}>
          <div style={{ display: 'flex' }}>
            {' '}
            <LabelText label="Dispute Period" />{' '}
            <Help hint={'What is dispute period'}>
              Period of time after price submission that the price can be overrided by the disputer.
            </Help>{' '}
          </div>
          <div style={{ paddingTop: '3%' }}>
            {haveValidSelection ? Number(allOracleAssets[selectedAssetIndex].pricer.disputePeriod) / 60 : 0} Minutes
          </div>
        </div>
      </div>
      <SectionTitle title="Price Submissions" />
      <DataView
        status={isLoading ? 'loading' : 'default'}
        fields={['Expiry', 'Price', 'Submitted Timestamp', 'Submitted By']}
        emptyState={PRICE_SUBMISSION}
        entriesPerPage={8}
        entries={assetHistory.sort((a, b) => (Number(a.expiry) > Number(b.expiry) ? -1 : 1))}
        renderEntry={({ expiry, reportedTimestamp, price, isDisputed }: SubgraphPriceEntry) => {
          const tag = isDisputed ? <Tag mode="new"> Disputer </Tag> : <Tag> Pricer </Tag>
          return [
            expiryToDate(expiry),
            `${toTokenAmount(new BigNumber(price), 8).toString()} USD`,
            reportedTimestamp,
            tag,
          ]
        }}
      />
    </StyledContainer>
  )
}

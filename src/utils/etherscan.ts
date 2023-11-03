import axios from 'axios'

import { Chain, CHAIN_TO_CHAIN_ID } from 'constants/chains'
import { DEFAULT_DECIMALS } from 'constants/tokens'

import { getUSDCContractAddress } from './addresses'

const CHAIN_TO_BASEURL = {
  ETH: 'https://api-goerli.etherscan.io/api',
  OP: 'https://api-goerli-optimism.etherscan.io/api',
  AVAX: 'https://api-testnet.snowtrace.io/api',
  ARB: 'https://api-goerli.arbiscan.io/api',
}

const AVAX_APIKEY = 'BKM47ENB892CKB17SQQDYN2YDRRAYZYB19'
const ETH_APIKEY = '8W3HDGND7RDTY566QPV1ERJR69BU6DS6JP'

interface EtherscanResponse {
  status: string
  message: string
  result: string
}

export async function getUSDCAmountByChain(
  chain: Chain,
  account: string
): Promise<number> {
  const chainID = CHAIN_TO_CHAIN_ID[chain]
  const USDCAddress = getUSDCContractAddress(chainID)
  const baseURL = CHAIN_TO_BASEURL[chain]
  const params = {
    module: 'account',
    action: 'tokenbalance',
    contractaddress: USDCAddress,
    address: account,
    tag: 'latest',
    apikey: chain === Chain.AVAX ? AVAX_APIKEY : ETH_APIKEY,
  }
  try {
    const res = await axios.get<EtherscanResponse>(baseURL, { params })
    if (res.data.status !== '1') {
      console.error(chain, account, res.data)
      return 0
    }
    return parseInt(res.data.result, 10) / 10 ** DEFAULT_DECIMALS
  } catch (error) {
    console.error(error)
    return 0
  }
}

function weiToEther(wei: string): number {
  return parseInt(wei, 10) / 10 ** 18
}

export async function getNativeAmountByChain(
  chain: Chain,
  account: string
): Promise<number> {
  const baseURL = CHAIN_TO_BASEURL[chain]
  const params = {
    module: 'account',
    action: 'balance',
    address: account,
    tag: 'latest',
    apikey: chain === Chain.AVAX ? AVAX_APIKEY : ETH_APIKEY,
  }
  try {
    const res = await axios.get<EtherscanResponse>(baseURL, { params })
    if (res.data.status !== '1') {
      console.error(chain, account, res.data)
      return 0
    }
    return weiToEther(res.data.result)
  } catch (error) {
    console.error(error)
    return 0
  }
}

interface TokenPriceResponse {
  data: {
    priceUsd: string
  }
}

export async function getNativeTokenPrice(chain: Chain) {
  const url =
    chain === Chain.AVAX
      ? 'https://api.coincap.io/v2/assets/avalanche'
      : 'https://api.coincap.io/v2/assets/ethereum'
  try {
    const res = await axios.get<TokenPriceResponse>(url)
    return parseFloat(res.data.data.priceUsd)
  } catch (error) {
    console.error(error)
    return 0
  }
}

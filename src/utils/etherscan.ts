import axios from 'axios'

import { Chain } from 'constants/chains'
import {
  CHAIN_TO_TOKEN_TO_ADDRESS,
  Token,
  TOKEN_TO_DECIMALS,
} from 'constants/tokens'

const CHAIN_TO_APIBASEURL = {
  [Chain.ETH]: 'https://api-goerli.etherscan.io/api',
  [Chain.OP]: 'https://api-goerli-optimism.etherscan.io/api',
  [Chain.AVAX]: 'https://api-testnet.snowtrace.io/api',
  [Chain.ARB]: 'https://api-goerli.arbiscan.io/api',
}

const CHAIN_TO_APIKEY = {
  [Chain.ETH]: '8W3HDGND7RDTY566QPV1ERJR69BU6DS6JP',
  [Chain.OP]: '8W3HDGND7RDTY566QPV1ERJR69BU6DS6JP',
  [Chain.ARB]: '8W3HDGND7RDTY566QPV1ERJR69BU6DS6JP',
  [Chain.AVAX]: 'BKM47ENB892CKB17SQQDYN2YDRRAYZYB19',
}

interface EtherscanResponse {
  status: string
  message: string
  result: string
}

export async function getERC20AmountByChain(
  token: Token,
  chain: Chain,
  account: string
): Promise<number> {
  const tokenAddress = CHAIN_TO_TOKEN_TO_ADDRESS[chain][token]
  const baseURL = CHAIN_TO_APIBASEURL[chain]
  const params = {
    module: 'account',
    action: 'tokenbalance',
    contractaddress: tokenAddress,
    address: account,
    tag: 'latest',
    apikey: CHAIN_TO_APIKEY[chain],
  }
  try {
    const res = await axios.get<EtherscanResponse>(baseURL, { params })
    if (res.data.status !== '1') {
      console.error(chain, account, res.data)
      return 0
    }
    return parseInt(res.data.result, 10) / 10 ** TOKEN_TO_DECIMALS[token]
  } catch (error) {
    console.error(error)
    return 0
  }
}

function weiToEther(wei: string): number {
  return parseInt(wei, 10) / 10 ** 18
}

export async function getNativeTokenAmountByChain(
  chain: Chain,
  account: string
): Promise<number> {
  const baseURL = CHAIN_TO_APIBASEURL[chain]
  const params = {
    module: 'account',
    action: 'balance',
    address: account,
    tag: 'latest',
    apikey: CHAIN_TO_APIKEY[chain],
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

const TOKEN_TO_PRICEAPI = {
  [Token.ETH]: 'https://api.coincap.io/v2/assets/ethereum',
  [Token.AVAX]: 'https://api.coincap.io/v2/assets/avalanche',
  [Token.UNI]: 'https://api.coincap.io/v2/assets/uniswap',
  [Token.USDC]: 'https://api.coincap.io/v2/assets/usd-coin',
  [Token.USDT]: 'https://api.coincap.io/v2/assets/tether',
}

export async function getTokenPrice(token: Token) {
  const url = TOKEN_TO_PRICEAPI[token]
  try {
    const res = await axios.get<TokenPriceResponse>(url)
    return parseFloat(res.data.data.priceUsd)
  } catch (error) {
    console.error(error)
    return 0
  }
}

export async function getTokenAmount(
  token: Token,
  chain: Chain,
  account: string
) {
  if (token === Token.ETH || token === Token.AVAX) {
    return await getNativeTokenAmountByChain(chain, account)
  }
  return await getERC20AmountByChain(token, chain, account)
}

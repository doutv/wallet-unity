import AVAXICON from 'assets/chains/AVAX.svg'
import ETHICON from 'assets/chains/ETH.svg'
import UNIICON from 'assets/tokens/UNI.svg'
import USDCICON from 'assets/tokens/USDC.svg'
import USDTICON from 'assets/tokens/USDT.svg'

import { CHAIN_IDS_TO_USDC_ADDRESSES } from './addresses'
import { Chain, SupportedChainId } from './chains'

export enum Token {
  USDC = 'USDC',
  ETH = 'ETH',
  AVAX = 'AVAX',
  USDT = 'USDT',
  UNI = 'UNI',
}

export const CHAIN_TO_NATIVE_TOKEN = {
  [Chain.ETH]: Token.ETH,
  [Chain.AVAX]: Token.AVAX,
  [Chain.OP]: Token.ETH,
  [Chain.ARB]: Token.ETH,
}

export const NATIVE_TOKEN_ADDRESS = 'NATIVE'
export const EMPTY_TOKEN_ADDRESS = 'EMPTY'

export const CHAIN_TO_TOKEN_TO_ADDRESS = {
  [Chain.ETH]: {
    [Token.ETH]: NATIVE_TOKEN_ADDRESS,
    [Token.USDC]: CHAIN_IDS_TO_USDC_ADDRESSES[SupportedChainId.ETH_GOERLI],
    [Token.USDT]: '0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49',
    [Token.UNI]: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    [Token.AVAX]: EMPTY_TOKEN_ADDRESS,
  },
  [Chain.OP]: {
    [Token.ETH]: NATIVE_TOKEN_ADDRESS,
    [Token.USDC]: CHAIN_IDS_TO_USDC_ADDRESSES[SupportedChainId.OP_GOERLI],
    [Token.USDT]: EMPTY_TOKEN_ADDRESS,
    [Token.UNI]: EMPTY_TOKEN_ADDRESS,
    [Token.AVAX]: EMPTY_TOKEN_ADDRESS,
  },
  [Chain.AVAX]: {
    [Token.AVAX]: NATIVE_TOKEN_ADDRESS,
    [Token.USDC]: CHAIN_IDS_TO_USDC_ADDRESSES[SupportedChainId.AVAX_FUJI],
    [Token.USDT]: EMPTY_TOKEN_ADDRESS,
    [Token.UNI]: EMPTY_TOKEN_ADDRESS,
    [Token.ETH]: EMPTY_TOKEN_ADDRESS,
  },
  [Chain.ARB]: {
    [Token.ETH]: NATIVE_TOKEN_ADDRESS,
    [Token.USDC]: CHAIN_IDS_TO_USDC_ADDRESSES[SupportedChainId.ARB_GOERLI],
    [Token.USDT]: EMPTY_TOKEN_ADDRESS,
    [Token.UNI]: EMPTY_TOKEN_ADDRESS,
    [Token.AVAX]: EMPTY_TOKEN_ADDRESS,
  },
}

export const TOKEN_ICONS = {
  [Token.ETH]: ETHICON,
  [Token.USDC]: USDCICON,
  [Token.USDT]: USDTICON,
  [Token.UNI]: UNIICON,
  [Token.AVAX]: AVAXICON,
}

export const TOKEN_TO_DECIMALS = {
  [Token.ETH]: 18,
  [Token.USDC]: 6,
  [Token.USDT]: 6,
  [Token.UNI]: 18,
  [Token.AVAX]: 18,
}

export const DEFAULT_DECIMALS = TOKEN_TO_DECIMALS[Token.USDC] // USDC

export function getTokenAddress(chain: Chain, token: Token): string {
  return CHAIN_TO_TOKEN_TO_ADDRESS[chain][token]
}

export function isTokenExist(chain: Chain, token: Token): boolean {
  return getTokenAddress(chain, token) !== EMPTY_TOKEN_ADDRESS
}

export function isNativeToken(chain: Chain, token: Token): boolean {
  return getTokenAddress(chain, token) === NATIVE_TOKEN_ADDRESS
}

export const TOKEN_TO_LOGOURI = {
  [Token.USDC]:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  [Token.USDT]:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  [Token.UNI]:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
  [Token.ETH]:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  [Token.AVAX]:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanche/info/logo.png',
}

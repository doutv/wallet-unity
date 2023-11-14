import { useEffect, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { SwapWidget } from '@uniswap/widgets'
import { useWeb3React } from '@web3-react/core'

import NetworkAlert from 'components/NetworkAlert/NetworkAlert'
import { Chain, CHAIN_TO_CHAIN_ID, CHAIN_TO_CHAIN_NAME } from 'constants/chains'
import {
  getTokenAddress,
  isNativeToken,
  isTokenExist,
  NATIVE_TOKEN_ADDRESS,
  Token,
  TOKEN_TO_DECIMALS,
  TOKEN_TO_LOGOURI,
} from 'constants/tokens'
import useSwitchNetwork from 'hooks/useSwitchNetwork'

import type { Web3Provider } from '@ethersproject/providers'
import type { DefaultAddress, TokenInfo } from '@uniswap/widgets'

export interface SwapInputs {
  srcToken: Token
  destToken: Token
  chain: Chain
}

export const DEFAULT_SWAP_INPUTS: SwapInputs = {
  srcToken: Token.ETH,
  destToken: Token.USDC,
  chain: Chain.ETH,
}

interface Props {
  handleClose: () => void
  open: boolean
  swapInputs: SwapInputs
}

const SwapDialog = ({ handleClose, open, swapInputs }: Props) => {
  const { library, chainId } = useWeb3React<Web3Provider>()
  const { switchNetwork } = useSwitchNetwork(swapInputs.chain)
  const [tokenList, setTokenList] = useState<TokenInfo[]>([])
  const [defaultOutputTokenAddress] = useState<DefaultAddress>(
    getTokenAddress(swapInputs.chain, Token.USDC)
  )

  useEffect(() => {
    if (chainId != null && CHAIN_TO_CHAIN_ID[swapInputs.chain] !== chainId) {
      switchNetwork().catch(console.error)
    }
  }, [chainId, swapInputs.chain, switchNetwork])

  useEffect(() => {
    const chainId = CHAIN_TO_CHAIN_ID[swapInputs.chain]
    setTokenList(
      Object.values(Token)
        .filter(
          (token) =>
            isTokenExist(swapInputs.chain, token) &&
            !isNativeToken(swapInputs.chain, token)
        )
        .map((token) => {
          return {
            name: token,
            address: getTokenAddress(swapInputs.chain, token),
            symbol: token,
            decimals: TOKEN_TO_DECIMALS[token],
            chainId,
            logoURI: TOKEN_TO_LOGOURI[token],
          }
        })
    )
  }, [swapInputs])

  return (
    <Dialog maxWidth="md" fullWidth={true} onClose={handleClose} open={open}>
      <DialogTitle>
        Swap {swapInputs.srcToken} for {swapInputs.destToken} on{' '}
        {CHAIN_TO_CHAIN_NAME[swapInputs.chain]}
      </DialogTitle>
      <div className="flex flex-col items-center justify-center gap-8">
        {chainId != null && CHAIN_TO_CHAIN_ID[swapInputs.chain] !== chainId ? (
          <NetworkAlert className="w-full" chain={swapInputs.chain} />
        ) : (
          <SwapWidget
            provider={library}
            width="100%"
            defaultInputTokenAddress={NATIVE_TOKEN_ADDRESS}
            defaultOutputTokenAddress={defaultOutputTokenAddress}
            tokenList={tokenList}
          />
        )}
      </div>
      <DialogActions>
        <Button size="large" color="secondary" onClick={handleClose}>
          BACK
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default SwapDialog

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
import useSwitchNetwork from 'hooks/useSwitchNetwork'
import { getUSDCContractAddress } from 'utils/addresses'

import type { Web3Provider } from '@ethersproject/providers'
import type { DefaultAddress, TokenInfo } from '@uniswap/widgets'

export interface SwapInputs {
  srcToken: string
  destToken: string
  chain: Chain
}

export const DEFAULT_SWAP_INPUTS: SwapInputs = {
  srcToken: 'ETH',
  destToken: 'USDC',
  chain: Chain.ETH,
}

interface Props {
  handleClose: () => void
  open: boolean
  swapInputs: SwapInputs
}

const NATIVE = 'NATIVE' // Special address for native token

const SwapDialog = ({ handleClose, open, swapInputs }: Props) => {
  const { library, chainId } = useWeb3React<Web3Provider>()
  const { switchNetwork } = useSwitchNetwork(swapInputs.chain)
  const [tokenList, setTokenList] = useState<TokenInfo[]>()
  const [defaultOutputTokenAddress, setDefaultOutputTokenAddress] =
    useState<DefaultAddress>()

  useEffect(() => {
    if (chainId != null && CHAIN_TO_CHAIN_ID[swapInputs.chain] !== chainId) {
      switchNetwork().catch(console.error)
    }
  }, [chainId, swapInputs.chain, switchNetwork])

  useEffect(() => {
    const inputChainId = CHAIN_TO_CHAIN_ID[swapInputs.chain]
    setTokenList([
      {
        name: 'USD Coin',
        address: getUSDCContractAddress(inputChainId),
        symbol: 'USDC',
        decimals: 6,
        chainId: inputChainId,
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      },
    ])
    setDefaultOutputTokenAddress(() => ({
      inputChainId: getUSDCContractAddress(inputChainId),
    }))
  }, [swapInputs.chain])

  return (
    <Dialog maxWidth="md" fullWidth={true} onClose={handleClose} open={open}>
      <DialogTitle>
        Swap {swapInputs.srcToken} for {swapInputs.destToken} on{' '}
        {CHAIN_TO_CHAIN_NAME[swapInputs.chain]}
      </DialogTitle>
      <DialogContent className="flex flex-col items-center justify-center gap-8">
        {chainId != null && CHAIN_TO_CHAIN_ID[swapInputs.chain] !== chainId ? (
          <NetworkAlert className="w-full" chain={swapInputs.chain} />
        ) : (
          <SwapWidget
            provider={library}
            width="100%"
            defaultInputTokenAddress={NATIVE}
            defaultOutputTokenAddress={defaultOutputTokenAddress}
            tokenList={tokenList}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button size="large" color="secondary" onClick={handleClose}>
          BACK
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default SwapDialog

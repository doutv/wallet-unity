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
import { getUSDCContractAddress } from 'utils/addresses'

import type { Web3Provider } from '@ethersproject/providers'

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
  const { library } = useWeb3React<Web3Provider>()
  const USDCAddress = getUSDCContractAddress(
    CHAIN_TO_CHAIN_ID[swapInputs.chain]
  )
  return (
    <Dialog maxWidth="md" fullWidth={true} onClose={handleClose} open={open}>
      <DialogTitle>
        Swap {swapInputs.srcToken} for {swapInputs.destToken} on{' '}
        {CHAIN_TO_CHAIN_NAME[swapInputs.chain]}
      </DialogTitle>
      <DialogContent className="flex flex-col items-center justify-center gap-8">
        <NetworkAlert className="w-full" chain={swapInputs.chain} />
        <SwapWidget
          provider={library}
          width="100%"
          defaultInputTokenAddress={NATIVE}
          defaultOutputTokenAddress={USDCAddress}
        />
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

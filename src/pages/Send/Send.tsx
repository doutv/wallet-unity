import { useEffect, useState } from 'react'
import { createSearchParams, useNavigate } from 'react-router-dom'

import { Avatar, Table } from '@douyinfe/semi-ui'
import { Button, InputAdornment, TextField } from '@mui/material'
import { useWeb3React } from '@web3-react/core'

import { CHAIN_ICONS } from 'assets/chains'
import USDCIcon from 'assets/tokens/USDC.svg'
import ConnectWallet from 'components/ConnectWallet/ConnectWallet'
import SendConfirmationDialog from 'components/Send/SendConfirmationDialog'
import SendForm, { DEFAULT_FORM_INPUTS } from 'components/Send/SendForm'
import SwapDialog, { DEFAULT_SWAP_INPUTS } from 'components/Send/SwapDialog'
import TransactionDialog from 'components/TransactionDialog/TransactionDialog'
import { Chain, CHAIN_TO_CHAIN_NAME } from 'constants/chains'
import { TX_HASH_KEY } from 'constants/index'
import { TransactionStatus, TransactionType } from 'contexts/AppContext'
import { useQueryParam } from 'hooks/useQueryParam'
import { useTransactionPolling } from 'hooks/useTransactionPolling'
import {
  getNativeAmountByChain,
  getNativeTokenPrice,
  getUSDCAmountByChain,
} from 'utils/etherscan'

import type { Web3Provider } from '@ethersproject/providers'
import type { SwapInputs } from 'components/Send/SwapDialog'
import type { TransactionInputs } from 'contexts/AppContext'

enum Action {
  None,
  Bridge,
  Swap,
}

interface TokenData {
  key: string
  token: string
  tokenIcon: string
  price: string
  amount: string
  usd: string
  action: Action
  chain: Chain
  children?: TokenData[]
}

const getTokenData = async (chain: Chain, address: string) => {
  const nativeToken = chain === Chain.AVAX ? 'AVAX' : 'ETH'
  const nativeAmount = await getNativeAmountByChain(chain, address)
  const nativePrice = await getNativeTokenPrice(chain)
  const nativeUSDValue = nativeAmount * nativePrice
  const USDCPrice = 1
  const USDCAmount = await getUSDCAmountByChain(chain, address)
  const USDCUSDValue = USDCAmount * USDCPrice
  const totalUSDValue = nativeUSDValue + USDCUSDValue

  return {
    key: chain,
    token: CHAIN_TO_CHAIN_NAME[chain],
    tokenIcon: CHAIN_ICONS[chain],
    price: '',
    amount: '',
    usd: `$${totalUSDValue.toFixed(2)}`,
    action: Action.None,
    chain,
    children: [
      {
        key: chain + '1',
        token: nativeToken,
        tokenIcon:
          chain === Chain.AVAX
            ? CHAIN_ICONS[Chain.AVAX]
            : CHAIN_ICONS[Chain.ETH],
        price: `$${nativePrice.toFixed(2)}`,
        amount: nativeAmount.toFixed(4),
        usd: `$${nativeUSDValue.toFixed(2)}`,
        action: Action.Swap,
        chain,
      },
      {
        key: chain + '2',
        token: 'USDC',
        tokenIcon: USDCIcon,
        price: `$${USDCPrice.toFixed(2)}`,
        amount: USDCAmount.toFixed(4),
        usd: `$${USDCUSDValue.toFixed(2)}`,
        action: Action.Bridge,
        chain,
      },
    ],
  }
}

function Send() {
  const columns = [
    {
      title: 'Token',
      dataIndex: 'token',
      key: 'token',
      render: (text: string, record: { tokenIcon: string }) => {
        return (
          <span>
            <Avatar
              className="mr-2 h-8 w-8"
              src={record.tokenIcon}
              alt={text}
            />
            {text}
          </span>
        )
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      // width: 200,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      // width: 200,
    },
    {
      title: 'USD Value',
      dataIndex: 'usd',
      key: 'usd',
      // width: 200,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text: Action, record: { token: string; chain: Chain }) => {
        switch (text) {
          case Action.Bridge:
            return (
              <Button
                variant="contained"
                color="info"
                className="normal-case"
                onClick={() => handleBrige(record.chain)}
              >
                Bridge
              </Button>
            )
          case Action.Swap:
            return (
              <Button
                disabled={
                  // Uniswap Widget does not support Arbitrum Goerli and Avalanche Fuji
                  record.chain === Chain.AVAX || record.chain === Chain.ARB
                }
                variant="contained"
                color="info"
                className="normal-case"
                onClick={() => handleSwap(record.chain, record.token)}
              >
                Swap
              </Button>
            )
          default:
            return <></>
        }
      },
    },
  ]

  const handleBrige = (srcChain: Chain) => {
    setFormInputs((state) => ({
      ...state,
      source: srcChain,
      address,
    }))
    setIsSendFormDialogOpen(true)
  }

  const handleSwap = (srcChain: Chain, srcToken: string) => {
    setSwapInputs((state) => ({
      ...state,
      chain: srcChain,
      srcToken,
    }))
    setIsSwapDialogOpen(true)
  }

  const [tokenDatas, setTokenDatas] = useState<TokenData[]>([])
  const [address, setAddress] = useState<string>('')
  const { account, active } = useWeb3React<Web3Provider>()
  const [formInputs, setFormInputs] =
    useState<TransactionInputs>(DEFAULT_FORM_INPUTS)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendFormDialogOpen, setIsSendFormDialogOpen] = useState(false)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false)
  const [swapInputs, setSwapInputs] = useState<SwapInputs>(DEFAULT_SWAP_INPUTS)
  const { txHash, transaction, setSearchParams } = useQueryParam()
  const navigate = useNavigate()

  // Fetch token datas from API
  const fetchTokenDatas = async (address: string) => {
    if (!address) {
      return
    }
    setIsLoading(true)
    const newTokenDatas: Array<Promise<TokenData>> = Object.values(Chain).map(
      async (chain) => await getTokenData(chain, address)
    )
    setTokenDatas(await Promise.all(newTokenDatas))
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTokenDatas(address).catch(console.error)
  }, [address])

  useEffect(() => {
    // Redirect to Redeem page if send tx is complete and signature is fetched or it's a redeem tx
    if (
      transaction &&
      ((transaction.type === TransactionType.SEND &&
        transaction.status === TransactionStatus.COMPLETE &&
        transaction.signature != null) ||
        transaction.type === TransactionType.REDEEM)
    ) {
      navigate(
        {
          pathname: '/redeem',
          search: createSearchParams({
            [TX_HASH_KEY]: txHash,
          }).toString(),
        },
        {
          replace: true,
        }
      )
    } else if (txHash) {
      setIsTransactionDialogOpen(true)
    }
  }, [navigate, transaction, txHash])

  const handleNext = () => {
    setIsConfirmationDialogOpen(true)
  }

  const handleConfirmation = (txHash: string) => {
    setIsConfirmationDialogOpen(false)
    setSearchParams({ [TX_HASH_KEY]: txHash }, { replace: true })
    setIsTransactionDialogOpen(true)
  }

  const handleComplete = () => {
    setIsTransactionDialogOpen(false)
    navigate({
      pathname: '/redeem',
      search: createSearchParams({
        [TX_HASH_KEY]: txHash,
      }).toString(),
    })
  }

  const { handleSendTransactionPolling } = useTransactionPolling(handleComplete)

  const getSumUSDValue = (tokenDatas: TokenData[]) => {
    let sum = 0
    tokenDatas.forEach((tokenData) => {
      sum += parseFloat(tokenData.usd.replace('$', ''))
    })
    return `$${sum.toFixed(2)}`
  }

  useEffect(() => {
    setAddress(account as string)
  }, [account])

  return (
    <>
      <div className="item-center mx-auto flex max-w-4xl flex-col justify-center gap-6">
        <h1>Unite your multichain assets</h1>
        <p className="text-center text-xl">
          Secured by Circle&apos;s Cross-Chain Transfer Protocol
        </p>
        <div className="flex justify-center">
          <ConnectWallet />
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <TextField
            className="w-full"
            id="address"
            label="Wallet Address"
            variant="outlined"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    color="secondary"
                    onClick={() => setAddress(account as string)}
                    disabled={!account || !active}
                  >
                    COPY FROM WALLET
                  </Button>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            className="w-full"
            id="profolio"
            label="Profolio in USD Value"
            variant="outlined"
            value={getSumUSDValue(tokenDatas)}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: true }}
          />
          <Table
            className="semi-always-dark"
            columns={columns}
            expandAllRows
            expandAllGroupRows
            dataSource={tokenDatas}
            pagination={false}
            loading={isLoading}
          />
        </div>
      </div>

      {isSwapDialogOpen && (
        <SwapDialog
          handleClose={() => {
            setIsSwapDialogOpen(false)
            fetchTokenDatas(address).catch(console.error)
          }}
          open={isSwapDialogOpen}
          swapInputs={swapInputs}
        />
      )}

      {isSendFormDialogOpen && (
        <SendForm
          handleClose={() => setIsSendFormDialogOpen(false)}
          handleNext={handleNext}
          open={isSendFormDialogOpen}
          formInputs={formInputs}
          handleUpdateForm={setFormInputs}
        />
      )}

      {isConfirmationDialogOpen && (
        <SendConfirmationDialog
          handleClose={() => setIsConfirmationDialogOpen(false)}
          handleNext={handleConfirmation}
          open={isConfirmationDialogOpen}
          formInputs={formInputs}
        />
      )}

      {transaction && isTransactionDialogOpen && (
        <TransactionDialog
          handleTransactionPolling={handleSendTransactionPolling}
          open={isTransactionDialogOpen}
          transaction={transaction}
        />
      )}
    </>
  )
}

export default Send

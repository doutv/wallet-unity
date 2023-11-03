import { useEffect, useState } from 'react'
import { createSearchParams, useNavigate } from 'react-router-dom'

import { Avatar, Table } from '@douyinfe/semi-ui'
import { useWeb3React } from '@web3-react/core'

import { CHAIN_ICONS } from 'assets/chains'
import USDCIcon from 'assets/tokens/USDC.svg'
import SendConfirmationDialog from 'components/Send/SendConfirmationDialog'
import SendForm, { DEFAULT_FORM_INPUTS } from 'components/Send/SendForm'
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
import type { TransactionInputs } from 'contexts/AppContext'

const columns = [
  {
    title: 'Token',
    dataIndex: 'token',
    key: 'token',
    render: (text: string, record: { tokenIcon: string }) => {
      return (
        <div>
          <Avatar className="mr-2 h-8 w-8" src={record.tokenIcon} alt={text} />
          {text}
        </div>
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
]

interface TokenData {
  key: string
  token: string
  tokenIcon: string
  price: string
  amount: string
  usd: string
  children?: TokenData[]
}

function Send() {
  const [tokenDatas, setTokenDatas] = useState<TokenData[]>([])
  const { account } = useWeb3React<Web3Provider>()
  const [formInputs, setFormInputs] =
    useState<TransactionInputs>(DEFAULT_FORM_INPUTS)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const { txHash, transaction, setSearchParams } = useQueryParam()
  const navigate = useNavigate()

  useEffect(() => {
    const getTokenDatas = async () => {
      if (!account) {
        return
      }
      const newTokenDatas: TokenData[] = []
      for (const chain in Chain) {
        const nativeToken = chain === Chain.AVAX ? 'AVAX' : 'ETH'
        const nativeAmount = await getNativeAmountByChain(
          chain as Chain,
          account
        )
        const nativePrice = await getNativeTokenPrice(chain as Chain)
        const nativeUSDValue = nativeAmount * nativePrice
        const USDCPrice = 1
        const USDCAmount = await getUSDCAmountByChain(chain as Chain, account)
        const USDCUSDValue = USDCAmount * USDCPrice
        const totalUSDValue = nativeUSDValue + USDCUSDValue
        newTokenDatas.push({
          key: chain,
          token: CHAIN_TO_CHAIN_NAME[chain],
          tokenIcon: CHAIN_ICONS[chain as Chain],
          price: '',
          amount: '',
          usd: `$${totalUSDValue.toFixed(2)}`,
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
            },
            {
              key: chain + '2',
              token: 'USDC',
              tokenIcon: USDCIcon,
              price: `$${USDCPrice.toFixed(2)}`,
              amount: USDCAmount.toFixed(4),
              usd: `$${USDCUSDValue.toFixed(2)}`,
            },
          ],
        })
      }
      setTokenDatas(newTokenDatas)
    }

    getTokenDatas().catch(console.error)
  }, [account])

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

  return (
    <>
      <div className="item-center mx-auto flex max-w-4xl flex-col justify-center">
        <h1>Unite your multichain assets</h1>
        <p className="mt-8 text-center text-xl">
          Secured by Circle&apos;s Cross-Chain Transfer Protocol
        </p>

        <Table
          className="mt-24"
          columns={columns}
          expandAllRows
          expandAllGroupRows
          dataSource={tokenDatas}
          pagination={false}
          loading={tokenDatas.length === 0}
        />

        <div className="m-24 flex flex-col">
          <SendForm
            handleNext={handleNext}
            formInputs={formInputs}
            handleUpdateForm={setFormInputs}
          />
        </div>
      </div>

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

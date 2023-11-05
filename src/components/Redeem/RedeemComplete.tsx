import { Button } from '@mui/material'

import TransactionDetails from 'components/TransactionDetails/TransactionDetails'

import type { Transaction } from 'contexts/AppContext'

interface Props {
  handleReturn: () => void
  transaction: Transaction | undefined
}

const RedeemComplete: React.FC<Props> = ({ handleReturn, transaction }) => {
  return (
    <>
      <h1>Bridge completed</h1>
      <p className="mt-8 text-center text-xl">
        Your bridge of USDC across chains was successful. See below for details.
      </p>

      <div className="m-24 flex flex-col">
        <TransactionDetails transaction={transaction} />

        <Button
          className="mt-12"
          size="large"
          fullWidth={true}
          onClick={handleReturn}
        >
          Start a new bridge
        </Button>
      </div>
    </>
  )
}

export default RedeemComplete

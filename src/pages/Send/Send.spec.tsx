import { screen } from '@testing-library/react'

import { render } from 'tests/renderer'

import Send from './Send'

describe('Send', () => {
  it('renders send page', () => {
    render(<Send />)

    expect(screen.getByText(/Bridge USDC across chains/i)).toBeInTheDocument()
  })
})

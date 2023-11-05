import { screen } from '@testing-library/react'

import { render } from 'tests/renderer'

import Nav from './Nav'

describe('Nav', () => {
  it('has all the links', () => {
    render(<Nav />)

    const bridgeLink = screen.getAllByText(/Bridge/i)[1] as HTMLAnchorElement
    expect(bridgeLink.href).toContain('/')
  })
})

import React from 'react'
import Banner from './index'

describe('<Banner />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Banner />)
  })
})
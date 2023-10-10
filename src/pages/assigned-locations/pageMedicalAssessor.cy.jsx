import React from 'react'
import MedicalAssessor from '.'

describe('<MedicalAssessor />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<MedicalAssessor />)
  })
})
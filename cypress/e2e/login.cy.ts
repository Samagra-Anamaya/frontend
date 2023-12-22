describe('Login Flow', () => {
  const username = "gp_115550";
  const password = "pass_115550";

  it('Visits the login page', () => {
    cy.visit('')
  })

  it('Attempts Login', () => {

    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('#loginBtn').click();

  })

  it('Assert login is correct', () => {

    cy.get('#enumeratorId').should('have.text', username)

  })
})
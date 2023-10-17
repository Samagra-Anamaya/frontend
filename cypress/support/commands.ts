/// <reference types="cypress" />

// import cypress = require("cypress");

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add("login", (loginType, credentials, otpValues) => {
  cy.session([loginType, otpValues, credentials], () => {
    cy.visit("http://localhost:3000");
    cy.get("#language-selector-hindi").click();
    if (loginType === "aadhar") {
      cy.get("#login-input-aadhar").type(credentials);
      cy.get("#login-button").click();
      cy.get(".swal-button.swal-button--confirm").click();
      otpValues.forEach((value, index) => {
        const selector = `input[aria-label='Please enter OTP character ${
          index + 1
        }']`;
        cy.get(selector).type(value);
      });
      cy.get("#otp-button").click();
      cy.get(".swal-button.swal-button--confirm").click();
    } else if (loginType === "mobile") {
      cy.get("#mobile-button").click();
      cy.get("#login-input-aadhar").type(credentials);
      cy.get("#login-button").click();
      cy.get(".swal-button.swal-button--confirm").click();
      otpValues.forEach((value, index) => {
        const selector = `input[aria-label='Please enter OTP character ${
          index + 1
        }']`;
        cy.get(selector).type(value);
      });
      cy.get("#otp-button").click();
      cy.get(".swal-button.swal-button--confirm").click();
    }
  });
});
//discovery step 1 form

Cypress.Commands.add("discoveryStep1", () => {
  cy.visit("http://localhost:3000/discovery");
  cy.get("input[name='name']")
    .type("Aakash Satpute")
    .should("have.value", "Aakash Satpute");
  cy.get(":nth-child(2) > .dropdown").click();
  cy.get(`a[value='Male']`).click();
  cy.get("input[name='age']").type("20");
  cy.get(":nth-child(4) > .dropdown").click();
  cy.get(`a[value='Yes']`).click();
  cy.get(".px-7").click();
});

Cypress.Commands.add("discoveryStep2", () => {
  cy.discoveryStep1();
  cy.get(`div[value='SC']`).click();
  cy.get(".justify-around > :nth-child(2)").click();
});
Cypress.Commands.add("discoveryStep3", () => {
  cy.discoveryStep2();
  cy.get("div[value='Yes'][name='religion']").click();
  cy.get("div[value='Yes'][name='disabilityStatus']").click();
  cy.get(".justify-around > :nth-child(2)").click();
});
Cypress.Commands.add("discoveryStep4", () => {
  cy.discoveryStep3();
  cy.get(":nth-child(1) > .dropdown").click();
  cy.get(`a[value='Farmer']`).click();
  cy.get(":nth-child(2) > .dropdown").click();
  cy.get(`a[value='50,001-100,000']`).click();
  cy.get(".justify-around > :nth-child(2)").click();
});
Cypress.Commands.add("discoveryPositiveScenario", () => {
  cy.discoveryStep1();
  cy.get(`div[value='OBC']`).click();
  cy.get(".justify-around > :nth-child(2)").click();
  cy.get("div[value='Yes'][name='religion']").click();
  cy.get("div[value='Yes'][name='disabilityStatus']").click();
  cy.get(".justify-around > :nth-child(2)").click();
  cy.get(":nth-child(1) > .dropdown").click();
  cy.get(`a[value='Farmer']`).click();
  cy.get(":nth-child(2) > .dropdown").click();
  cy.get(`a[value='0-50,000']`).click();
  cy.get(".justify-around > :nth-child(2)").click();
  cy.get(".swal-button").click();
  cy.get(".bg-white > :nth-child(2)").click();
  cy.get(".border-4").click();
  cy.get(".bg-white > :nth-child(2)").click();
  cy.get(".false").click();
  cy.get(".bg-white > :nth-child(2)").click();
  cy.get(".justify-center > .font-medium").click();
  cy.get("div[value='Own Land']").click();
  const nextButton =
    "button[class='my-6 font-medium rounded bg-[#E1703B] py-2 px-10 text-white hover:bg-[#c0440b]']";
  const selectOption = "div[value='No']";
  const numberOfIterations = 8;
  for (let i = 0; i < numberOfIterations; i++) {
    cy.get(nextButton).click();
    cy.get(selectOption).click();
  }
  cy.get(nextButton).click();
});

// verify text with array
Cypress.Commands.add("verifyTextInElement", (elementSelector, expectedText) => {
  cy.get(elementSelector).should((element) => {
    const elementText = element.text();
    const containsExpectedValue = expectedText.some((value) =>
      elementText.includes(value)
    );
    expect(containsExpectedValue).to.be.true;
  });
});

// global commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(
        loginType: string,
        credentials: string,
        otpValues: string[]
      ): Chainable<void>;
      verifyTextInElement(
        elementSelector: string,
        expectedText: string[]
      ): Chainable<void>;
      discoveryStep1();
      discoveryStep2();
      discoveryStep3();
      discoveryStep4();
      discoveryPositiveScenario();
    }
  }
}
export {};

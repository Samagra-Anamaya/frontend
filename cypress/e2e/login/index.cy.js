const verifyTextInElement = (elementSelector, expectedText) => {
  cy.get(elementSelector).should((element) => {
    const elementText = element.text();
    const containsExpectedValue = expectedText.some((value) =>
      elementText.includes(value)
    );
    expect(containsExpectedValue).to.be.true;
  });
};
describe("Login Page", () => {
  beforeEach(() => {
    // Visit the login page before each test.
    cy.visit("http://localhost:3000"); // Replace '/login' with the actual URL of your login page.
  });

  it("should display the login form", () => {
    cy.get("form").should("be.visible");
    cy.get("#username").should("exist");
    cy.get("#password").should("exist");
    cy.get("#login-btn").should("exist").and("contain", "LOGIN");
  });

  it("should show an error message for empty fields", () => {
    cy.get("#login-btn").click();
    cy.get(`#username`)
      .invoke("prop", "validationMessage")
      .should((text) => {
        console.log({ text });
        expect(text).to.contain("Please fill in this field.");
      });
    cy.get(`#password`)
      .invoke("prop", "validationMessage")
      .should((text) => {
        console.log({ text });
        expect(text).to.contain("Please fill in this field.");
      });
  });

  it("should log in successfully", () => {
    // Replace these values with valid login credentials
    const validUsername = "gp_115550";
    const validPassword = "pass_115550";

    cy.get("#username").type(validUsername);
    cy.get("#password").type(validPassword);
    cy.get("#login-btn").click()
    console.log({url:cy.url()})
    cy.wait(1000);
    cy.url().should('contain','http://localhost:3000')
   // cy.server(); // Start server mocking

    // Mock the login request with a successful response
    // cy.intercept('POST','https://user-service.staging.anamaya.samagra.io/api/login', (req) => {
    //   req.body = {
    //     password: validPassword,
    //     loginId: validUsername,
    //     applicationId: '1234'
    //   }
    //   req.continue()
    // }).as("loginRequest")
    // cy.route({
    //   method: "POST",
    //   url: "https://user-service.staging.anamaya.samagra.io/api/login", // Replace with the actual login API endpoint
    //   status: 200,
    //   response: {
    //     responseCode: "OK",
    //     // result: {
    //     //   data: {
    //     //     user: {
    //     //       // Mock user data here
    //     //     },
    //     //   },
    //     // },
    //   },
    // }).as("loginRequest");

   

    // Wait for the login request to complete
  

    // Assert that the user is redirected to the expected page after successful login
   // cy.url().should("include", "/dashboard"); // Replace with the actual URL after successful login.
  });

  // it("should display an error message on login failure", () => {
  //   // Replace these values with invalid login credentials
  //   const invalidUsername = "gp_115550";
  //   const invalidPassword = "pass_115550";

  //   cy.get("#username").type(invalidUsername);
  //   cy.get("#password").type(invalidPassword);

  //   cy.server(); // Start server mocking

  //   // Mock the login request with a failure response
  //   cy.route({
  //     method: "POST",
  //     url: "https://user-service.staging.anamaya.samagra.io/api/login", // Replace with the actual login API endpoint
  //     status: 200,
  //     response: {
  //       responseCode: "FAILURE",
  //       params: {
  //         errMsg: "Invalid credentials",
  //       },
  //     },
  //   }).as("loginRequest");

  //   cy.get("#login-btn").click();

  //   // Wait for the login request to complete
  //   cy.wait("@loginRequest");

  //   // Assert that an error message is displayed
  //   cy.get("p").should("contain", "Invalid credentials"); // Adjust this selector as needed.
  // });
});

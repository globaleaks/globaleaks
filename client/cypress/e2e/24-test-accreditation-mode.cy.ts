describe("Activate accreditation mode", () => {
  it("should enable accreditation signup mode", function() {
    cy.login_admin();

    cy.visit("/#/admin/sites");
    cy.get('[data-cy="options"]').should('be.visible').click();
    cy.get('select[name="type"]').select('accreditation');
    cy.takeScreenshot("admin/signup_configuration");
    cy.get('i.fa-solid.fa-check').click();

    cy.logout();
  });
});

describe('admin add and configure accreditor', () => {
  const accred_user =
    {
      name: "Accreditation_Resp_Accreditation",
      value: "accreditor",
      address: "globaleaks-accred-accreditator@mailinator.com",
    };

  it("should add accreditor", () => {
    cy.login_admin();
    cy.visit("/#/admin/users");

    const make_account = (user: any) => {
      cy.get(".show-add-user-btn").click();
      cy.get('select[name="role"]').select(user.value);
      cy.get('input[name="username"]').clear().type(user.name);
      cy.get('input[name="name"]').clear().type(user.name);
      cy.get('input[name="email"]').clear().type(user.address);
      cy.get("#add-btn").click();
    };

    make_account(accred_user);
    cy.get(".userList").should('have.length', 7);
  });

  it("should configure accreditor's password", () => {
    cy.login_admin();
    cy.visit("/#/admin/users");

    cy.get(".userList").eq(0).within(() => {
      if (Cypress.$("#edit_user").length > 0) {
        cy.get("#edit_user").should('be.visible', { timeout: 10000 }).click();
        cy.get("#set_password").first().click();
        cy.get('input[name="password"]').clear().type(Cypress.env("init_password"));
        cy.get('#setPasswordButton').should('be.visible').click();
      }
    });

    cy.logout();
  });
});

describe("Resp_Accreditation first login", () => {
  it("should require password change upon successful authentication", () => {
    cy.login_accreditor("Accreditation_Resp_Accreditation", Cypress.env("init_password"), "#/login", true);
    cy.get('[name="changePasswordArgs.password"]').should('be.visible', { timeout: 10000 }).type(Cypress.env("user_password"));
    cy.get('[name="changePasswordArgs.confirm"]').type(Cypress.env("user_password"));
    cy.get('button[name="submit"]').click();
    cy.url().should("include", "/accreditor/home");
    cy.logout();
  });
});
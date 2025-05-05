describe("Navigation", () => {
  beforeEach(() => {
    // Login before each test
    cy.login()
    cy.mockRouter()
    cy.visit("/")
  })

  it("navigates to different sections using the sidebar", () => {
    // Dashboard
    cy.contains("Dashboard").click()
    cy.get("@routerPush").should("have.been.calledWith", "/dashboard")

    // Angebote
    cy.contains("Angebote").click()
    cy.get("@routerPush").should("have.been.calledWith", "/angebote")

    // Verkaufschancen
    cy.contains("Verkaufschancen").click()
    cy.get("@routerPush").should("have.been.calledWith", "/verkaufschancen")

    // Auftragsbestätigungen
    cy.contains("Auftragsbestätigungen").click()
    cy.get("@routerPush").should("have.been.calledWith", "/auftragsbestatigungen")

    // Blöcke
    cy.contains("Blöcke").click()
    cy.get("@routerPush").should("have.been.calledWith", "/bloecke")

    // Artikel
    cy.contains("Artikel").click()
    cy.get("@routerPush").should("have.been.calledWith", "/artikel")
  })

  it("shows user dropdown when clicking on user avatar", () => {
    // Find and click the user menu button
    cy.get('button[aria-label="User menu"]').click()

    // Check if the dropdown is visible
    cy.contains("Profil").should("be.visible")
    cy.contains("Einstellungen").should("be.visible")
    cy.contains("Abmelden").should("be.visible")
  })
})

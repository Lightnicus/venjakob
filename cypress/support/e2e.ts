// Import commands.js using ES2015 syntax:
import "./commands"

// Mock the API responses for Cypress tests
beforeEach(() => {
  // Mock API responses
  cy.intercept("GET", "/api/offers", {
    statusCode: 200,
    body: [
      {
        id: 1,
        offerNumber: "AB-12345",
        customer: { name: "Test Customer" },
        currentVersion: {
          versionNumber: "V1",
          status: "Entwurf",
          createdAt: new Date().toISOString(),
        },
      },
    ],
  }).as("getOffers")

  cy.intercept("GET", "/api/offers/1", {
    statusCode: 200,
    body: {
      id: 1,
      offerNumber: "AB-12345",
      customer: { name: "Test Customer" },
      currentVersion: {
        id: 1,
        versionNumber: "V1",
        title: "Test Offer",
        status: "Entwurf",
      },
      versions: [
        {
          id: 1,
          versionNumber: "V1",
          title: "Test Offer",
          status: "Entwurf",
          createdAt: new Date().toISOString(),
        },
      ],
    },
  }).as("getOffer")

  cy.intercept("POST", "/api/offers/1/versions", {
    statusCode: 200,
    body: {
      id: 2,
      versionNumber: "V2",
      title: "Test Offer",
      status: "Veröffentlicht",
      createdAt: new Date().toISOString(),
    },
  }).as("createVersion")

  cy.intercept("POST", "/api/offers", {
    statusCode: 200,
    body: {
      id: 2,
      offerNumber: "AB-67890",
      title: "Neues Testangebot",
    },
  }).as("createOffer")

  cy.intercept("PUT", "/api/offers/*", {
    statusCode: 200,
    body: {
      id: 1,
      offerNumber: "AB-12345",
      title: "Updated Offer",
    },
  }).as("updateOffer")
})

// Cypress doesn't have a great way to handle Next.js app router, so we'll mock the navigation
Cypress.Commands.add("mockNavigation", () => {
  cy.window().then((win) => {
    win.history.pushState = cy.stub().as("historyPushState")
    win.history.replaceState = cy.stub().as("historyReplaceState")
  })
})

// Add a command to stub the fetch API
Cypress.Commands.add("mockFetch", () => {
  cy.window().then((win) => {
    win.fetch = cy.stub().as("fetchStub")
    win.fetch.resolves({
      ok: true,
      json: cy.stub().resolves({}),
    })
  })
})

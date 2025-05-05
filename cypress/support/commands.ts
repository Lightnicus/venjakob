/// <reference types="cypress" />

// Add custom commands here
Cypress.Commands.add("getBySel", (selector, ...args) => {
  return cy.get(`[data-testid=${selector}]`, ...args)
})

Cypress.Commands.add("getBySelLike", (selector, ...args) => {
  return cy.get(`[data-testid*=${selector}]`, ...args)
})

// Mock the Next.js router
Cypress.Commands.add("mockRouter", () => {
  cy.window().then((win) => {
    win.next = {
      router: {
        push: cy.stub().as("routerPush"),
        replace: cy.stub().as("routerReplace"),
        prefetch: cy.stub().as("routerPrefetch"),
      },
    }
  })
})

// Add a command to login
Cypress.Commands.add("login", () => {
  cy.session("loggedIn", () => {
    // Set a cookie or localStorage item to simulate being logged in
    cy.setCookie("auth", "true")
    localStorage.setItem("user", JSON.stringify({ id: 1, name: "Test User", role: "admin" }))
  })
})

// Add a command to create a test offer
Cypress.Commands.add("createTestOffer", () => {
  cy.intercept("POST", "/api/offers", {
    statusCode: 200,
    body: {
      id: 999,
      offerNumber: "TEST-999",
      title: "Cypress Test Offer",
    },
  }).as("createTestOffer")

  cy.visit("/angebote/neu")
  cy.get("#title").type("Cypress Test Offer")
  cy.get("button").contains("Speichern").click()
  cy.wait("@createTestOffer")
})

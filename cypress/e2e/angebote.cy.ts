import { describe, beforeEach, it } from "cypress"

describe("Angebote Page", () => {
  beforeEach(() => {
    // Login before each test
    cy.login()

    // Visit the angebote page
    cy.visit("/angebote")
    cy.mockRouter()
  })

  it("displays the list of offers", () => {
    // Create a stub for the offers list
    cy.intercept("GET", "/api/offers", {
      statusCode: 200,
      fixture: "offers.json",
    }).as("getOffers")

    // Reload the page to trigger the intercepted request
    cy.reload()
    cy.wait("@getOffers")

    // Check if the offer is displayed
    cy.contains("AB-12345").should("be.visible")
  })

  it("navigates to offer detail page when clicking on an offer", () => {
    // Create stubs for the offers list and single offer
    cy.intercept("GET", "/api/offers", {
      statusCode: 200,
      fixture: "offers.json",
    }).as("getOffers")

    cy.intercept("GET", "/api/offers/1", {
      statusCode: 200,
      fixture: "offer.json",
    }).as("getOffer")

    // Reload the page to trigger the intercepted request
    cy.reload()
    cy.wait("@getOffers")

    // Click on the offer
    cy.contains("AB-12345").click()

    // Check if the router was called with the correct path
    cy.get("@routerPush").should("have.been.calledWith", "/angebote/1")
  })

  it("creates a new version of an offer", () => {
    // Create a stub for the single offer
    cy.intercept("GET", "/api/offers/1", {
      statusCode: 200,
      fixture: "offer.json",
    }).as("getOffer")

    // Create a stub for creating a new version
    cy.intercept("POST", "/api/offers/1/versions", {
      statusCode: 200,
      body: {
        id: 2,
        versionNumber: "V2",
        title: "Test Offer",
        status: "Veröffentlicht",
      },
    }).as("createVersion")

    // Visit the offer detail page
    cy.visit("/angebote/1")
    cy.wait("@getOffer")

    // Click on the "Neue Version erstellen" button
    cy.contains("Neue Version erstellen").click()

    // Fill in the form
    cy.get('input[name="title"]').type("Preisanpassung")
    cy.get('textarea[name="description"]').type("Preise wurden angepasst")

    // Submit the form
    cy.contains("button", "Version erstellen").click()

    // Check if the API was called
    cy.wait("@createVersion")
  })

  it("switches between tabs in the offer editor", () => {
    // Create a stub for the single offer
    cy.intercept("GET", "/api/offers/1", {
      statusCode: 200,
      fixture: "offer.json",
    }).as("getOffer")

    // Visit the offer detail page
    cy.visit("/angebote/1")
    cy.wait("@getOffer")

    // Click on the tabs
    cy.contains("Kalkulation").click()
    cy.contains("Vorschau").click()
    cy.contains("Versionen").click()

    // Check if the content changes
    cy.contains("Versionsverlauf").should("be.visible")
  })

  it("creates a new offer", () => {
    // Create a stub for creating a new offer
    cy.intercept("POST", "/api/offers", {
      statusCode: 200,
      body: {
        id: 2,
        offerNumber: "AB-67890",
        title: "Neues Testangebot",
      },
    }).as("createOffer")

    // Visit the new offer page
    cy.visit("/angebote/neu")

    // Fill in the form
    cy.get("#title").type("Neues Testangebot")

    // Select a customer
    cy.get('button[role="combobox"]').first().click()
    cy.contains("Schüller Möbelwerk KG").click()

    // Save the offer
    cy.contains("Speichern").click()

    // Check if the API was called
    cy.wait("@createOffer")
  })
})

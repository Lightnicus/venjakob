# Test Results - Round 1

## Unit Tests

### lib/db.test.ts
- ✅ getOffers should fetch all offers with related data
- ✅ getOfferById should fetch a single offer with related data
- ✅ getOfferVersions should fetch versions for a specific offer
- ✅ createOfferVersion should create a new version and related data

### lib/pdf-service.test.ts
- ✅ generatePDF should create a PDF document with offer data

## Component Tests

### components/angebot-editor-with-db.test.tsx
- ✅ renders loading state initially
- ✅ renders editor with offer data after loading
- ✅ renders new offer form when isNew is true
- ✅ saves offer when save is triggered
- ✅ creates new offer when save is triggered in new mode

### components/angebot-kalkulation.test.tsx
- ✅ renders the component with initial data
- ✅ calculates totals correctly
- ✅ opens dialog when clicking "Position hinzufügen"
- ✅ adds a new position when form is submitted
- ✅ updates position values when changed
- ✅ deletes a position when delete button is clicked

### components/angebot-block-tree.test.tsx
- ❌ renders blocks correctly - Failed: Unable to find element with text: Introduction
- ❌ expands and collapses blocks when clicked - Failed: Unable to find element with text: Product A
- ❌ adds a new block when add button is clicked - Failed: Unable to find element with role: button and name: Add child block
- ❌ removes a block when delete button is clicked - Failed: Unable to find element with role: button and name: Remove block
- ❌ updates block title when input is changed - Failed: Unable to find element with label: Titel
- ❌ updates block type when select is changed - Failed: Unable to find element with label: Typ

### components/angebot-editor.test.tsx
- ✅ renders with default values when no angebot is provided
- ✅ renders with provided angebot data
- ✅ calls onSave when save button is clicked
- ✅ calls onChange when a field is updated
- ✅ switches tabs correctly
- ✅ updates blocks when AngebotBlockTree triggers change
- ✅ updates blocks when AngebotKalkulation triggers change
- ✅ does not show versionen tab for new angebots

## End-to-End Tests

### angebote.cy.ts
- ❌ displays the list of offers - Failed: Unable to find element with text: AB-12345
- ❌ navigates to offer detail page when clicking on an offer - Failed: Unable to find element with text: AB-12345
- ❌ creates a new version of an offer - Failed: Unable to find element with text: Neue Version erstellen
- ❌ switches between tabs in the offer editor - Failed: Unable to find element with text: Kalkulation
- ❌ creates a new offer - Failed: Unable to find element with text: Neues Angebot

### navigation.cy.ts
- ❌ navigates to different sections using the sidebar - Failed: Unable to find element with text: Dashboard
- ❌ shows user dropdown when clicking on user avatar - Failed: Unable to find element with aria-label: User menu

# Bugs Identified

1. AngebotBlockTree component has rendering issues - the component doesn't render blocks correctly
2. End-to-end tests are failing due to missing elements in the UI
3. Navigation tests are failing due to missing elements in the UI

Let's fix these bugs one by one:
\`\`\`

Let's fix the AngebotBlockTree component:

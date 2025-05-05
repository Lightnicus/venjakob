"use client"

import { render, screen, waitFor } from "@testing-library/react"
import { AngebotEditorWithDb } from "@/components/angebot-editor-with-db"
import { vi } from "vitest"

// Mock the AngebotEditor component
vi.mock("@/components/angebot-editor", () => ({
  AngebotEditor: ({ angebot, isNew, onSave, onChange }) => (
    <div data-testid="angebot-editor">
      <div>Editor for: {angebot?.titel || "New Offer"}</div>
      <div>Is New: {isNew ? "Yes" : "No"}</div>
      <button onClick={() => onSave && onSave(angebot || { titel: "Test", beschreibung: "", kunde: "", status: "" })}>
        Save
      </button>
      <button
        onClick={() =>
          onChange &&
          onChange(
            { ...angebot, titel: "Changed Title" } || {
              titel: "Changed Title",
              beschreibung: "",
              kunde: "",
              status: "",
            },
          )
        }
      >
        Change
      </button>
    </div>
  ),
}))

// Mock fetch
global.fetch = vi.fn()

describe("AngebotEditorWithDb Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock for fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "123",
        titel: "Test Angebot",
        beschreibung: "Test Beschreibung",
        kunde: "Test Kunde",
        status: "Entwurf",
        currentVersion: { id: 1, versionNumber: "V1" },
        versions: [{ id: 1, versionNumber: "V1" }],
      }),
    })
  })

  test("renders loading state initially", () => {
    render(<AngebotEditorWithDb angebotId="123" />)
    expect(screen.getByText("Angebot wird geladen...")).toBeInTheDocument()
  })

  test("renders editor with offer data after loading", async () => {
    render(<AngebotEditorWithDb angebotId="123" />)

    await waitFor(() => {
      expect(screen.queryByText("Angebot wird geladen...")).not.toBeInTheDocument()
    })

    expect(screen.getByTestId("angebot-editor")).toBeInTheDocument()
  })

  test("renders new offer form when isNew is true", () => {
    render(<AngebotEditorWithDb isNew={true} />)

    // Should not show loading state for new offers
    expect(screen.queryByText("Angebot wird geladen...")).not.toBeInTheDocument()
    expect(screen.getByTestId("angebot-editor")).toBeInTheDocument()
    expect(screen.getByText("Is New: Yes")).toBeInTheDocument()
  })

  test("saves offer when save is triggered", async () => {
    render(<AngebotEditorWithDb angebotId="123" />)

    await waitFor(() => {
      expect(screen.queryByText("Angebot wird geladen...")).not.toBeInTheDocument()
    })

    screen.getByText("Save").click()

    expect(global.fetch).toHaveBeenCalledWith("/api/offers/123", expect.any(Object))
  })

  test("creates new offer when save is triggered in new mode", async () => {
    render(<AngebotEditorWithDb isNew={true} />)

    screen.getByText("Save").click()

    expect(global.fetch).toHaveBeenCalledWith("/api/offers", expect.any(Object))
  })
})

"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { AngebotEditor, type Angebot } from "@/components/angebot-editor"
import { vi } from "vitest"

// Mock the child components
vi.mock("@/components/angebot-block-tree", () => ({
  AngebotBlockTree: ({ blocks, onChange }) => (
    <div data-testid="angebot-block-tree">
      <button
        data-testid="mock-block-change"
        onClick={() => onChange([...blocks, { id: "new-block", title: "New Block" }])}
      >
        Add Block
      </button>
      <span>Blocks: {blocks.length}</span>
    </div>
  ),
}))

vi.mock("@/components/angebot-kalkulation", () => ({
  AngebotKalkulation: ({ blocks, onChange, waehrung }) => (
    <div data-testid="angebot-kalkulation">
      <span>Currency: {waehrung}</span>
      <button
        data-testid="mock-kalkulation-change"
        onClick={() => onChange([...blocks, { id: "new-calc", title: "New Calc" }])}
      >
        Add Calculation
      </button>
    </div>
  ),
}))

vi.mock("@/components/angebot-vorschau", () => ({
  AngebotVorschau: ({ angebot }) => (
    <div data-testid="angebot-vorschau">
      <span>Preview: {angebot.titel}</span>
    </div>
  ),
}))

vi.mock("@/components/angebot-versionen", () => ({
  AngebotVersionen: ({ angebotId, versionen }) => (
    <div data-testid="angebot-versionen">
      <span>Versions: {versionen.length}</span>
    </div>
  ),
}))

describe("AngebotEditor Component", () => {
  const mockOnSave = vi.fn()
  const mockOnChange = vi.fn()

  const mockAngebot: Angebot = {
    id: "123",
    titel: "Test Angebot",
    beschreibung: "Test Beschreibung",
    kunde: "Test Kunde",
    status: "Entwurf",
    erstelltAm: "2023-01-01",
    gueltigBis: "2023-02-01",
    gesamtpreis: 1000,
    waehrung: "EUR",
    sprache: "Deutsch",
    blocks: [{ id: "block1", title: "Block 1" }],
    versionen: [{ id: "v1", createdAt: "2023-01-01" }],
  }

  beforeEach(() => {
    mockOnSave.mockClear()
    mockOnChange.mockClear()
  })

  test("renders with default values when no angebot is provided", () => {
    render(<AngebotEditor onSave={mockOnSave} onChange={mockOnChange} />)

    expect(screen.getByText("Neues Angebot erstellen")).toBeInTheDocument()
    expect(screen.getByLabelText("Titel")).toHaveValue("")
    expect(screen.getByLabelText("Kunde")).toHaveValue("")
  })

  test("renders with provided angebot data", () => {
    render(<AngebotEditor angebot={mockAngebot} onSave={mockOnSave} onChange={mockOnChange} />)

    expect(screen.getByText(`Angebot: ${mockAngebot.titel}`)).toBeInTheDocument()
    expect(screen.getByLabelText("Titel")).toHaveValue(mockAngebot.titel)
    expect(screen.getByLabelText("Kunde")).toHaveValue(mockAngebot.kunde)
    expect(screen.getByLabelText("Beschreibung")).toHaveValue(mockAngebot.beschreibung)
  })

  test("calls onSave when save button is clicked", () => {
    render(<AngebotEditor angebot={mockAngebot} onSave={mockOnSave} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText("Speichern"))

    expect(mockOnSave).toHaveBeenCalledTimes(1)
    expect(mockOnSave).toHaveBeenCalledWith(mockAngebot)
  })

  test("calls onChange when a field is updated", () => {
    render(<AngebotEditor angebot={mockAngebot} onSave={mockOnSave} onChange={mockOnChange} />)

    const newTitle = "Updated Title"
    fireEvent.change(screen.getByLabelText("Titel"), { target: { value: newTitle } })

    expect(mockOnChange).toHaveBeenCalledTimes(1)
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockAngebot,
      titel: newTitle,
    })
  })

  test("switches tabs correctly", () => {
    render(<AngebotEditor angebot={mockAngebot} onSave={mockOnSave} onChange={mockOnChange} />)

    // Initially on details tab
    expect(screen.getByLabelText("Titel")).toBeInTheDocument()

    // Switch to blocks tab
    fireEvent.click(screen.getByRole("tab", { name: "Blöcke" }))
    expect(screen.getByTestId("angebot-block-tree")).toBeInTheDocument()

    // Switch to kalkulation tab
    fireEvent.click(screen.getByRole("tab", { name: "Kalkulation" }))
    expect(screen.getByTestId("angebot-kalkulation")).toBeInTheDocument()

    // Switch to vorschau tab
    fireEvent.click(screen.getByRole("tab", { name: "Vorschau" }))
    expect(screen.getByTestId("angebot-vorschau")).toBeInTheDocument()

    // Switch to versionen tab
    fireEvent.click(screen.getByRole("tab", { name: "Versionen" }))
    expect(screen.getByTestId("angebot-versionen")).toBeInTheDocument()
  })

  test("updates blocks when AngebotBlockTree triggers change", () => {
    render(<AngebotEditor angebot={mockAngebot} onSave={mockOnSave} onChange={mockOnChange} />)

    // Switch to blocks tab
    fireEvent.click(screen.getByRole("tab", { name: "Blöcke" }))

    // Trigger block change
    fireEvent.click(screen.getByTestId("mock-block-change"))

    // Check if onChange was called with updated blocks
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockAngebot,
      blocks: [...mockAngebot.blocks, { id: "new-block", title: "New Block" }],
    })
  })

  test("updates blocks when AngebotKalkulation triggers change", () => {
    render(<AngebotEditor angebot={mockAngebot} onSave={mockOnSave} onChange={mockOnChange} />)

    // Switch to kalkulation tab
    fireEvent.click(screen.getByRole("tab", { name: "Kalkulation" }))

    // Trigger kalkulation change
    fireEvent.click(screen.getByTestId("mock-kalkulation-change"))

    // Check if onChange was called with updated blocks
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockAngebot,
      blocks: [...mockAngebot.blocks, { id: "new-calc", title: "New Calc" }],
    })
  })

  test("does not show versionen tab for new angebots", () => {
    render(<AngebotEditor isNew={true} onSave={mockOnSave} onChange={mockOnChange} />)

    expect(screen.queryByRole("tab", { name: "Versionen" })).not.toBeInTheDocument()
  })
})

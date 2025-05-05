import { render, screen, fireEvent } from "@testing-library/react"
import { AngebotKalkulation } from "@/components/angebot-kalkulation"
import "@testing-library/jest-dom"

describe("AngebotKalkulation Component", () => {
  test("renders the component with initial data", () => {
    render(<AngebotKalkulation />)

    expect(screen.getByText("Kalkulation")).toBeInTheDocument()
    expect(screen.getByText("Bürostühle")).toBeInTheDocument()
    expect(screen.getByText("Schreibtische")).toBeInTheDocument()
    expect(screen.getByText("Aktenschränke")).toBeInTheDocument()
  })

  test("calculates totals correctly", () => {
    render(<AngebotKalkulation />)

    // Find the total elements by their parent context
    const totalsSection = screen.getByText("Zwischensumme:").parentElement?.parentElement

    if (totalsSection) {
      // Check if the subtotal, tax, and total are displayed correctly
      expect(totalsSection.textContent).toContain("4759.88")
      expect(totalsSection.textContent).toContain("904.38")
      expect(totalsSection.textContent).toContain("5664.26")
    }
  })

  test('opens dialog when clicking "Position hinzufügen"', () => {
    render(<AngebotKalkulation />)

    // Find the button by its icon and text content
    const addButton = screen.getByRole("button", { name: /Position hinzufügen/i })
    fireEvent.click(addButton)

    expect(screen.getByText("Neue Position hinzufügen")).toBeInTheDocument()
    expect(screen.getByLabelText("Block")).toBeInTheDocument()
    expect(screen.getByLabelText("Bezeichnung")).toBeInTheDocument()
  })

  test("adds a new position when form is submitted", () => {
    render(<AngebotKalkulation />)

    // Open the dialog
    const addButton = screen.getByRole("button", { name: /Position hinzufügen/i })
    fireEvent.click(addButton)

    // Fill the form
    fireEvent.change(screen.getByLabelText("Bezeichnung"), { target: { value: "Neue Position" } })
    fireEvent.change(screen.getByLabelText("Menge"), { target: { value: "3" } })
    fireEvent.change(screen.getByLabelText("Einzelpreis (€)"), { target: { value: "100" } })

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Hinzufügen" }))

    // Check if the new position is added
    expect(screen.getByText("Neue Position")).toBeInTheDocument()
  })

  test("updates position values when changed", () => {
    render(<AngebotKalkulation />)

    // Get the first quantity input for "Bürostühle"
    const quantityInputs = screen.getAllByRole("spinbutton")
    const quantityInput = quantityInputs[0]

    // Change the quantity
    fireEvent.change(quantityInput, { target: { value: "10" } })

    // Find the updated price in the table
    const rows = screen.getAllByRole("row")
    const burostuhlRow = rows.find((row) => row.textContent?.includes("Bürostühle"))

    if (burostuhlRow) {
      expect(burostuhlRow.textContent).toContain("2999.90")
    }
  })

  test("deletes a position when delete button is clicked", () => {
    render(<AngebotKalkulation />)

    // Count initial positions
    const initialPositionCount = screen.getAllByText(/Bürostühle|Schreibtische|Aktenschränke/).length

    // Find and click the delete button for the first position
    const deleteButtons = screen.getAllByRole("button", { name: "" })
    const trashButton = deleteButtons.find((button) => button.innerHTML.includes("Trash"))

    if (trashButton) {
      fireEvent.click(trashButton)
    }

    // Check if the position count decreased
    const finalPositionCount = screen.getAllByText(/Bürostühle|Schreibtische|Aktenschränke/).length
    expect(finalPositionCount).toBeLessThan(initialPositionCount)
  })
})

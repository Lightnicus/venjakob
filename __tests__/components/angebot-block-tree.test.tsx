"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { AngebotBlockTree } from "@/components/angebot-block-tree"
import "@testing-library/jest-dom"
import { vi } from "vitest"

describe("AngebotBlockTree Component", () => {
  const mockBlocks = [
    {
      id: "block-1",
      title: "Introduction",
      type: "text",
      content: "This is an introduction",
    },
    {
      id: "block-2",
      title: "Products",
      type: "product",
      children: [
        {
          id: "block-2-1",
          title: "Product A",
          type: "product",
          price: 100,
        },
      ],
    },
  ]

  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("renders blocks correctly", () => {
    render(<AngebotBlockTree blocks={mockBlocks} onChange={mockOnChange} />)

    expect(screen.getByText("Introduction")).toBeInTheDocument()
    expect(screen.getByText("Products")).toBeInTheDocument()
  })

  test("expands and collapses blocks when clicked", () => {
    render(<AngebotBlockTree blocks={mockBlocks} onChange={mockOnChange} />)

    // Find the expand/collapse button for the Products block
    const expandButtons = screen.getAllByRole("button", { name: /Expand|Collapse/i })
    const productsExpandButton = expandButtons[1] // Second expand button (for Products)

    // Initially, Product A should be visible (blocks are expanded by default)
    expect(screen.getByText("Product A")).toBeInTheDocument()

    // Click to collapse
    fireEvent.click(productsExpandButton)

    // Product A should now be hidden
    expect(screen.queryByText("Product A")).not.toBeInTheDocument()

    // Click to expand again
    fireEvent.click(productsExpandButton)

    // Product A should be visible again
    expect(screen.getByText("Product A")).toBeInTheDocument()
  })

  test("adds a new block when add button is clicked", () => {
    render(<AngebotBlockTree blocks={mockBlocks} onChange={mockOnChange} />)

    // Find the add button for the root level
    const addButtons = screen.getAllByRole("button", { name: "Add child block" })
    fireEvent.click(addButtons[0]) // Click the first add button

    // Check if onChange was called with the updated blocks array
    expect(mockOnChange).toHaveBeenCalled()

    // The new block should be added to the first block's children
    const updatedBlocks = mockOnChange.mock.calls[0][0]
    expect(updatedBlocks[0].children).toBeDefined()
    expect(updatedBlocks[0].children.length).toBe(1)
    expect(updatedBlocks[0].children[0].title).toBe("Neuer Block")
  })

  test("removes a block when delete button is clicked", () => {
    render(<AngebotBlockTree blocks={mockBlocks} onChange={mockOnChange} />)

    // Find the delete button for the first block
    const deleteButtons = screen.getAllByRole("button", { name: "Remove block" })
    fireEvent.click(deleteButtons[0]) // Click the first delete button

    // Check if onChange was called with the updated blocks array
    expect(mockOnChange).toHaveBeenCalled()

    // The first block should be removed
    const updatedBlocks = mockOnChange.mock.calls[0][0]
    expect(updatedBlocks.length).toBe(1)
    expect(updatedBlocks[0].id).toBe("block-2")
  })

  test("updates block title when input is changed", () => {
    render(<AngebotBlockTree blocks={mockBlocks} onChange={mockOnChange} />)

    // Find the title input for the first block
    const titleInput = screen.getByLabelText("Titel")
    fireEvent.change(titleInput, { target: { value: "New Title" } })

    // Check if onChange was called with the updated blocks array
    expect(mockOnChange).toHaveBeenCalled()

    // The first block's title should be updated
    const updatedBlocks = mockOnChange.mock.calls[0][0]
    expect(updatedBlocks[0].title).toBe("New Title")
  })

  test("updates block type when select is changed", () => {
    render(<AngebotBlockTree blocks={mockBlocks} onChange={mockOnChange} />)

    // Find the type select for the first block
    const typeSelect = screen.getByLabelText("Typ")
    fireEvent.click(typeSelect)

    // Select "image" from the dropdown
    const imageOption = screen.getByText("Bild")
    fireEvent.click(imageOption)

    // Check if onChange was called with the updated blocks array
    expect(mockOnChange).toHaveBeenCalled()

    // The first block's type should be updated
    const updatedBlocks = mockOnChange.mock.calls[0][0]
    expect(updatedBlocks[0].type).toBe("image")
  })
})

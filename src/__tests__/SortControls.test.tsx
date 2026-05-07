import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SortControls from '../components/SortControls'
import type { SortState } from '../hooks/useSort'

describe('SortControls', () => {
  const defaultProps = {
    sort: { field: 'stars' as const, order: 'desc' as const },
    onSortChange: vi.fn(),
    onToggleOrder: vi.fn(),
  }

  it('renders sort select with all options', () => {
    render(<SortControls {...defaultProps} />)
    const select = screen.getByRole('combobox', { name: /sort repositories/i })
    expect(select).toBeInTheDocument()

    expect(screen.getByText(/Most Starred/)).toBeInTheDocument()
    expect(screen.getByText(/Most Forked/)).toBeInTheDocument()
    expect(screen.getByText(/Most Open PRs/)).toBeInTheDocument()
    expect(screen.getByText(/Recently Updated/)).toBeInTheDocument()
  })

  it('shows current sort field as selected', () => {
    render(<SortControls {...defaultProps} />)
    const select = screen.getByRole('combobox', { name: /sort repositories/i })
    expect(select).toHaveValue('stars')
  })

  it('calls onSortChange when field changes', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    render(<SortControls {...defaultProps} onSortChange={onSortChange} />)

    const select = screen.getByRole('combobox', { name: /sort repositories/i })
    await user.selectOptions(select, 'forks')

    expect(onSortChange).toHaveBeenCalledWith('forks')
  })

  it('calls onToggleOrder when order button is clicked', async () => {
    const user = userEvent.setup()
    const onToggleOrder = vi.fn()
    render(<SortControls {...defaultProps} onToggleOrder={onToggleOrder} />)

    const button = screen.getByRole('button', { name: /switch to ascending/i })
    await user.click(button)

    expect(onToggleOrder).toHaveBeenCalled()
  })

  it('shows ascending icon when order is asc', () => {
    render(<SortControls sort={{ field: 'stars', order: 'asc' }} onSortChange={vi.fn()} onToggleOrder={vi.fn()} />)
    const button = screen.getByRole('button', { name: /switch to descending/i })
    expect(button).toBeInTheDocument()
  })

  it('shows descending icon when order is desc', () => {
    render(<SortControls sort={{ field: 'stars', order: 'desc' }} onSortChange={vi.fn()} onToggleOrder={vi.fn()} />)
    const button = screen.getByRole('button', { name: /switch to ascending/i })
    expect(button).toBeInTheDocument()
  })
})

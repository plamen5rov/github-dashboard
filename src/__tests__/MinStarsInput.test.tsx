import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MinStarsInput from '../components/MinStarsInput'

describe('MinStarsInput', () => {
  it('does not commit while the user is still typing', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<MinStarsInput value={0} onChange={onChange} />)

    await user.type(screen.getByLabelText(/min/i), '100')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('commits the parsed value after the debounce window', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<MinStarsInput value={0} onChange={onChange} />)

    await user.type(screen.getByLabelText(/min/i), '250')
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(250), { timeout: 1500 })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('commits zero when the input is cleared', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<MinStarsInput value={50} onChange={onChange} />)

    await user.clear(screen.getByLabelText(/min/i))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(0), { timeout: 1500 })
  })

  it('renders the current committed value on mount', () => {
    render(<MinStarsInput value={120} onChange={vi.fn()} />)
    expect(screen.getByLabelText(/min/i)).toHaveValue(120)
  })
})

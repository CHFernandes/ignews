import { render, screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react"
import { Async } from "."

test('it renders correctly', async () => {
    render(<Async />)

    expect(screen.getByText('Hello World')).toBeInTheDocument();

    // Aguardar elementos assíncronos entrarem na tela

    // Option 1
    // expect(await screen.findByText('Button')).toBeInTheDocument();

    // Option 2
    await waitFor(() => {
        return expect(screen.getByText('Button')).toBeInTheDocument()
    })

    // Aguardar elementos assíncronos saírem da tela

    // Option 1

    await waitFor(() => {
        return expect(screen.queryByText('Invisible')).not.toBeInTheDocument()
    })

    // Option 2
    // await waitForElementToBeRemoved(screen.queryByText('Invisible'));
})
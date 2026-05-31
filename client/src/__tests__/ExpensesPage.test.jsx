import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ExpensesPage from '../pages/ExpensesPage';

vi.mock('../api/expensesApi', () => ({
  getExpenses: vi.fn().mockResolvedValue({ data: [], total: 0 }),
}));

describe('ExpensesPage', () => {
  it('renders the page heading', () => {
    render(
      <MemoryRouter>
        <ExpensesPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });

  // TODO: add tests for add form, edit, delete after implementation
});

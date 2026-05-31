import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ExpensesPage from '../pages/ExpensesPage';

vi.mock('../api/expensesApi', () => ({
  getExpenses: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  createExpense: vi.fn().mockResolvedValue({}),
}));

vi.mock('../api/categoriesApi', () => ({
  getCategories: vi.fn().mockResolvedValue([{ id: 1, name: 'Food', color: '#ff0000' }]),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ExpensesPage />
    </MemoryRouter>
  );
}

describe('ExpensesPage', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });

  it('renders the Add Expense form with all inputs', () => {
    renderPage();
    expect(screen.getByText('Add Expense')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('loads categories into the select dropdown', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument();
    });
  });

  it('displays fetched expenses in the list', async () => {
    const { getExpenses } = await import('../api/expensesApi');
    getExpenses.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          category_id: 1,
          category_name: 'Food',
          category_color: '#ff0000',
          amount: 12.5,
          description: 'Lunch',
          date: '2026-05-31',
        },
      ],
      total: 1,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Lunch')).toBeInTheDocument();
    });
  });
});

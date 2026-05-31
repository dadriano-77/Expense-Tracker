import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ExpensesPage from '../pages/ExpensesPage';
import { getExpenses, deleteExpense } from '../api/expensesApi';

vi.mock('../api/expensesApi', () => ({
  getExpenses: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  createExpense: vi.fn().mockResolvedValue({}),
  updateExpense: vi.fn().mockResolvedValue({}),
  deleteExpense: vi.fn().mockResolvedValue({}),
}));

vi.mock('../api/categoriesApi', () => ({
  getCategories: vi.fn().mockResolvedValue([{ id: 1, name: 'Food', color: '#ff0000' }]),
}));

const mockExpense = {
  id: 1,
  category_id: 1,
  category_name: 'Food',
  category_color: '#ff0000',
  amount: 12.5,
  description: 'Lunch',
  date: '2026-05-31',
};

function renderPage() {
  return render(
    <MemoryRouter>
      <ExpensesPage />
    </MemoryRouter>
  );
}

describe('ExpensesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getExpenses.mockResolvedValue({ data: [], total: 0 });
  });

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
    getExpenses.mockResolvedValueOnce({ data: [mockExpense], total: 1 });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Lunch')).toBeInTheDocument();
    });
  });

  it('Edit button reveals inline edit form with Save and Cancel', async () => {
    getExpenses.mockResolvedValue({ data: [mockExpense], total: 1 });
    renderPage();
    await waitFor(() => screen.getByText('Lunch'));
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('Cancel edit hides the inline edit form', async () => {
    getExpenses.mockResolvedValue({ data: [mockExpense], total: 1 });
    renderPage();
    await waitFor(() => screen.getByText('Lunch'));
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('Delete button calls deleteExpense when confirmed', async () => {
    getExpenses.mockResolvedValue({ data: [mockExpense], total: 1 });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderPage();
    await waitFor(() => screen.getByText('Lunch'));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(deleteExpense).toHaveBeenCalledWith(1);
  });
});

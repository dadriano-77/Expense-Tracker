import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BudgetsPage from '../pages/BudgetsPage';
import { getBudgets, upsertBudget, deleteBudget } from '../api/budgetsApi';

vi.mock('../api/budgetsApi', () => ({
  getBudgets: vi.fn().mockResolvedValue([]),
  upsertBudget: vi.fn().mockResolvedValue({}),
  deleteBudget: vi.fn().mockResolvedValue({}),
}));

vi.mock('../api/categoriesApi', () => ({
  getCategories: vi.fn().mockResolvedValue([{ id: 1, name: 'Food', color: '#ff0000' }]),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <BudgetsPage />
    </MemoryRouter>
  );
}

const mockBudget = {
  id: 1, category_id: 1, category_name: 'Food', category_color: '#ff0000',
  amount: 500, year: 2026, month: 6,
};

describe('BudgetsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByText('Budgets')).toBeInTheDocument();
  });

  it('renders month and year selectors', () => {
    renderPage();
    expect(screen.getByRole('combobox', { name: 'Month' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Year' })).toBeInTheDocument();
  });

  it('renders Set Budget form with category select and amount input', async () => {
    renderPage();
    expect(screen.getByText('Set Budget')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set' })).toBeInTheDocument();
  });

  it('displays fetched budgets', async () => {
    getBudgets.mockResolvedValueOnce([mockBudget]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/500\.00/)).toBeInTheDocument();
    });
  });

  it('Edit button reveals inline amount input with Save and Cancel', async () => {
    getBudgets.mockResolvedValueOnce([mockBudget]);
    renderPage();
    await waitFor(() => screen.getByText(/500\.00/));
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('spinbutton', { name: 'Edit amount' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('Cancel edit hides the inline edit form', async () => {
    getBudgets.mockResolvedValueOnce([mockBudget]);
    renderPage();
    await waitFor(() => screen.getByText(/500\.00/));
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('Save calls upsertBudget with updated amount', async () => {
    getBudgets.mockResolvedValueOnce([mockBudget]);
    renderPage();
    await waitFor(() => screen.getByText(/500\.00/));
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const input = screen.getByRole('spinbutton', { name: 'Edit amount' });
    await userEvent.clear(input);
    await userEvent.type(input, '600');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(upsertBudget).toHaveBeenCalledWith(expect.objectContaining({ amount: 600 }));
  });

  it('Delete button calls deleteBudget', async () => {
    getBudgets.mockResolvedValueOnce([mockBudget]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderPage();
    await waitFor(() => screen.getByText(/500\.00/));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(deleteBudget).toHaveBeenCalledWith(1);
  });
});

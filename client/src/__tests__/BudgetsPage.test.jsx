import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BudgetsPage from '../pages/BudgetsPage';

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

describe('BudgetsPage', () => {
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
    const { getBudgets } = await import('../api/budgetsApi');
    getBudgets.mockResolvedValueOnce([
      { id: 1, category_id: 1, category_name: 'Food', category_color: '#ff0000', amount: 500, year: 2026, month: 5 },
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/500\.00/)).toBeInTheDocument();
    });
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import DashboardPage from '../pages/DashboardPage';

vi.mock('axios');

const mockRow = {
  category_id: 1,
  category_name: 'Food',
  category_color: '#ff0000',
  budget_amount: 400,
  spent_amount: 150,
  remaining_amount: 250,
  utilization_percent: 37.5,
};

const mockResponse = (categories = [mockRow], overrides = {}) => ({
  data: { year: 2026, month: 5, total_budget: 400, total_spent: 150, categories, ...overrides },
});

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', () => {
    axios.get.mockResolvedValue(mockResponse());
    renderPage();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders month and year selectors', () => {
    axios.get.mockResolvedValue(mockResponse());
    renderPage();
    expect(screen.getByRole('combobox', { name: 'Month' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Year' })).toBeInTheDocument();
  });

  it('shows loading state before data arrives', () => {
    axios.get.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders table with category data after load', async () => {
    axios.get.mockResolvedValue(mockResponse());
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('$250.00')).toBeInTheDocument(); // remaining — unique to table row
      expect(screen.getByText('37.5%')).toBeInTheDocument();  // utilization — unique to table row
    });
  });

  it('highlights over-budget row with red background', async () => {
    const overBudgetRow = { ...mockRow, remaining_amount: -50, utilization_percent: 112.5 };
    axios.get.mockResolvedValue(mockResponse([overBudgetRow]));
    renderPage();
    await waitFor(() => screen.getByText('Food'));
    const row = screen.getByText('Food').closest('tr');
    expect(row).toHaveStyle({ background: '#fef2f2' });
  });

  it('shows empty state message when no data for the month', async () => {
    axios.get.mockResolvedValue(mockResponse([], { total_budget: 0, total_spent: 0 }));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No budget or spending data for this month.')).toBeInTheDocument();
    });
  });

  it('shows error message when fetch fails', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
    });
  });
});

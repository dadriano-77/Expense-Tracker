import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import ChartsPage from '../pages/ChartsPage';

vi.mock('axios');

vi.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

const mockDashboard = {
  year: 2026,
  month: 6,
  total_budget: 500,
  total_spent: 150,
  categories: [
    {
      category_id: 1,
      category_name: 'Food',
      category_color: '#ff0000',
      budget_amount: 300,
      spent_amount: 150,
      remaining_amount: 150,
      utilization_percent: 50,
    },
    {
      category_id: 2,
      category_name: 'Transport',
      category_color: '#0000ff',
      budget_amount: 200,
      spent_amount: 0,
      remaining_amount: 200,
      utilization_percent: 0,
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter>
      <ChartsPage />
    </MemoryRouter>
  );
}

describe('ChartsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', () => {
    axios.get.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Charts')).toBeInTheDocument();
  });

  it('renders month and year selectors', () => {
    axios.get.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('option', { name: 'June' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '2026' })).toBeInTheDocument();
  });

  it('shows loading state while fetching', () => {
    axios.get.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders pie chart and bar chart after data loads', async () => {
    axios.get.mockResolvedValue({ data: mockDashboard });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('shows empty state message when no spending data', async () => {
    axios.get.mockResolvedValue({
      data: { ...mockDashboard, categories: [{ ...mockDashboard.categories[0], spent_amount: 0 }] },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No spending data for this period.')).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Failed to load chart data')).toBeInTheDocument();
    });
  });

  it('changing the month selector re-fetches with new params', async () => {
    axios.get.mockResolvedValue({ data: mockDashboard });
    renderPage();
    await waitFor(() => screen.getByTestId('bar-chart'));
    const monthSelect = screen.getAllByRole('combobox')[0];
    await userEvent.selectOptions(monthSelect, '1');
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/dashboard', expect.objectContaining({ params: expect.objectContaining({ month: 1 }) }));
    });
  });

  it('changing the year selector re-fetches with new params', async () => {
    axios.get.mockResolvedValue({ data: mockDashboard });
    renderPage();
    await waitFor(() => screen.getByTestId('bar-chart'));
    const yearSelect = screen.getAllByRole('combobox')[1];
    await userEvent.selectOptions(yearSelect, '2025');
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/dashboard', expect.objectContaining({ params: expect.objectContaining({ year: 2025 }) }));
    });
  });
});

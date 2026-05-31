import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CategoriesPage from '../pages/CategoriesPage';

vi.mock('../api/categoriesApi', () => ({
  getCategories: vi.fn().mockResolvedValue([{ id: 1, name: 'Food', color: '#ff0000' }]),
  createCategory: vi.fn().mockResolvedValue({ id: 2, name: 'Transport', color: '#6366f1' }),
  updateCategory: vi.fn().mockResolvedValue({}),
  deleteCategory: vi.fn().mockResolvedValue({}),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <CategoriesPage />
    </MemoryRouter>
  );
}

describe('CategoriesPage', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('renders the Add Category form', () => {
    renderPage();
    expect(screen.getByText('Add Category')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('loads and displays categories', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
  });

  it('Edit button reveals inline edit form with Save and Cancel', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Food'));
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});

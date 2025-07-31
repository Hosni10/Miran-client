import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FoodListScreen } from '../src/screens/FoodListScreen';
import { searchFoods } from '../src/api/foods';
import { fetchFoodPage } from '../src/lib/api';
import { useAuth } from '../src/contexts/AuthContext';

// Mock the API functions
vi.mock('../src/api/foods');
vi.mock('../src/lib/api');
vi.mock('../src/contexts/AuthContext');

const mockSearchFoods = vi.mocked(searchFoods);
const mockFetchFoodPage = vi.mocked(fetchFoodPage);
const mockUseAuth = vi.mocked(useAuth);

// Mock auth context
mockUseAuth.mockReturnValue({
  loading: false,
  token: 'mock-token',
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  mockLogin: vi.fn(),
});

// Test wrapper with QueryClient
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('FoodSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful responses
    mockSearchFoods.mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          title: 'Bagel',
          secondary_food: 'Plain bagel',
          quantity: 100,
          unit: 'g',
          calories: 250,
          protein: 10,
          carbs: 48,
          fat: 2,
          protein_percentage: 16,
          carb_percentage: 77,
          fat_percentage: 7,
          image: null,
        },
        {
          id: 2,
          title: 'Everything Bagel',
          secondary_food: 'With seeds',
          quantity: 100,
          unit: 'g',
          calories: 270,
          protein: 11,
          carbs: 50,
          fat: 3,
          protein_percentage: 16,
          carb_percentage: 74,
          fat_percentage: 10,
          image: null,
        },
      ],
    });

    mockFetchFoodPage.mockResolvedValue({
      data: {
        count: 5,
        next: null,
        previous: null,
        result: [
          {
            id: 3,
            title: 'Chicken Breast',
            secondary_food: 'Grilled',
            quantity: 100,
            unit: 'g',
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            protein_percentage: 75,
            carb_percentage: 0,
            fat_percentage: 25,
            image: null,
          },
        ],
      },
      status: 200,
    } as unknown as { data: any; status: number });
  });

  it('should call searchFoods with correct parameters after 400ms debounce', async () => {
    const Wrapper = createTestWrapper();
    
    render(
      <Wrapper>
        <FoodListScreen />
      </Wrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search foods…');
    
    // Type "Bagel" in the search input
    fireEvent.change(searchInput, { target: { value: 'Bagel' } });

    // Should not call immediately
    expect(mockSearchFoods).not.toHaveBeenCalled();

    // Wait for debounce (400ms)
    await waitFor(
      () => {
        expect(mockSearchFoods).toHaveBeenCalledWith('Bagel', 1, 50);
      },
      { timeout: 500 }
    );
  });

  it('should call searchFoods with page 2 when next page is clicked', async () => {
    // Mock response with next page available
    mockSearchFoods.mockResolvedValue({
      count: 100,
      next: 'next-page-url',
      previous: null,
      results: [
        {
          id: 1,
          title: 'Bagel',
          secondary_food: 'Plain bagel',
          quantity: 100,
          unit: 'g',
          calories: 250,
          protein: 10,
          carbs: 48,
          fat: 2,
          protein_percentage: 16,
          carb_percentage: 77,
          fat_percentage: 7,
          image: null,
        },
      ],
    });

    const Wrapper = createTestWrapper();
    
    render(
      <Wrapper>
        <FoodListScreen />
      </Wrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search foods…');
    
    // Type search query
    fireEvent.change(searchInput, { target: { value: 'Bagel' } });

    // Wait for initial search
    await waitFor(() => {
      expect(mockSearchFoods).toHaveBeenCalledWith('Bagel', 1, 50);
    });

    // Click next page
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Should call with page 2
    await waitFor(() => {
      expect(mockSearchFoods).toHaveBeenCalledWith('Bagel', 2, 50);
    });
  });

  it('should fall back to fetchFoodPage when search input is cleared', async () => {
    const Wrapper = createTestWrapper();
    
    render(
      <Wrapper>
        <FoodListScreen />
      </Wrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search foods…');
    
    // Type search query first
    fireEvent.change(searchInput, { target: { value: 'Bagel' } });

    // Wait for search
    await waitFor(() => {
      expect(mockSearchFoods).toHaveBeenCalledWith('Bagel', 1, 50);
    });

    // Clear the input
    fireEvent.change(searchInput, { target: { value: '' } });

    // Wait for debounce and should call fetchFoodPage instead
    await waitFor(
      () => {
        expect(mockFetchFoodPage).toHaveBeenCalledWith('/v1/resources/food_list?limit=50&page=1');
      },
      { timeout: 500 }
    );
  });

  it('should reset page to 1 when search query changes', async () => {
    // Mock response with pagination
    mockSearchFoods.mockResolvedValue({
      count: 100,
      next: 'next-page-url',
      previous: null,
      results: [
        {
          id: 1,
          title: 'Bagel',
          secondary_food: 'Plain bagel',
          quantity: 100,
          unit: 'g',
          calories: 250,
          protein: 10,
          carbs: 48,
          fat: 2,
          protein_percentage: 16,
          carb_percentage: 77,
          fat_percentage: 7,
          image: null,
        },
      ],
    });

    const Wrapper = createTestWrapper();
    
    render(
      <Wrapper>
        <FoodListScreen />
      </Wrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search foods…');
    
    // Type initial search
    fireEvent.change(searchInput, { target: { value: 'Bagel' } });

    await waitFor(() => {
      expect(mockSearchFoods).toHaveBeenCalledWith('Bagel', 1, 50);
    });

    // Go to page 2
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSearchFoods).toHaveBeenCalledWith('Bagel', 2, 50);
    });

    // Change search query - should reset to page 1
    fireEvent.change(searchInput, { target: { value: 'Pizza' } });

    await waitFor(() => {
      expect(mockSearchFoods).toHaveBeenCalledWith('Pizza', 1, 50);
    });
  });

  it('should show loading overlay while fetching search results', async () => {
    // Mock a delayed response
    mockSearchFoods.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        count: 1,
        next: null,
        previous: null,
        results: [],
      }), 100))
    );

    const Wrapper = createTestWrapper();
    
    render(
      <Wrapper>
        <FoodListScreen />
      </Wrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search foods…');
    
    // Type search query
    fireEvent.change(searchInput, { target: { value: 'Bagel' } });

    // Wait for debounce and loading to start
    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should display search results correctly', async () => {
    const Wrapper = createTestWrapper();
    
    render(
      <Wrapper>
        <FoodListScreen />
      </Wrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search foods…');
    
    // Type search query
    fireEvent.change(searchInput, { target: { value: 'Bagel' } });

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Bagel')).toBeInTheDocument();
      expect(screen.getByText('Everything Bagel')).toBeInTheDocument();
      expect(screen.getByText('Showing 2 of 2 foods matching "Bagel"')).toBeInTheDocument();
    });
  });

  it('should show empty state when no search results found', async () => {
    // Mock empty response
    mockSearchFoods.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    const Wrapper = createTestWrapper();
    
    render(
      <Wrapper>
        <FoodListScreen />
      </Wrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search foods…');
    
    // Type search query that returns no results
    fireEvent.change(searchInput, { target: { value: 'NonexistentFood' } });

    // Wait for empty state
    await waitFor(() => {
      expect(screen.getByText('No foods found')).toBeInTheDocument();
      expect(screen.getByText('No foods match "NonexistentFood". Try a different search term.')).toBeInTheDocument();
    });
  });
}); 
import React from 'react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fireEvent, render, screen } from '@testing-library/react';
import '../../__mocks__/keycloakMock';
import TaskListPage from '../TaskLists/TaskListPage';
import { TaskSelectedTabContext } from '../../context/TaskSelectedTabContext';

describe('TaskListFilters', () => {
  const mockAxios = new MockAdapter(axios);
  const tabData = {
    selectedTabIndex: 1,
    selectTabIndex: jest.fn(),
  };
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.clearAllMocks();
    localStorage.removeItem('filters');
    mockAxios.reset();
  });

  beforeEach(() => {
    render(<TaskSelectedTabContext.Provider value={tabData}><TaskListPage /></TaskSelectedTabContext.Provider>);
  });

  it('should display filter options based on filter config (filters.js)', async () => {
    // Titles & Actions
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Apply filters')).toBeInTheDocument();
    expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    expect(screen.getByText('Modes')).toBeInTheDocument();
    expect(screen.getByText('Selectors')).toBeInTheDocument();

    // Check boxes
    expect(screen.getAllByRole('checkbox').length).toBe(3);
    expect(screen.getByLabelText('RoRo unaccompanied freight')).not.toBeChecked();
    expect(screen.getByLabelText('RoRo accompanied freight')).not.toBeChecked();
    expect(screen.getByLabelText('RoRo Tourist')).not.toBeChecked();

    // Radio buttons
    expect(screen.getAllByRole('radio').length).toBe(3);
    expect(screen.getByLabelText('Not present')).not.toBeChecked();
    expect(screen.getByLabelText('Present')).not.toBeChecked();
    expect(screen.getByLabelText('Any')).not.toBeChecked();
  });

  it('should allow user to select a single radio button in each group', async () => {
    // group one select
    fireEvent.click(screen.getByLabelText('RoRo accompanied freight'));
    // group two select first 'has', then 'has no'
    fireEvent.click(screen.getByLabelText('Present'));
    fireEvent.click(screen.getByLabelText('Not present'));

    expect(screen.getByLabelText('RoRo unaccompanied freight')).not.toBeChecked();
    expect(screen.getByLabelText('RoRo accompanied freight')).toBeChecked();
    expect(screen.getByLabelText('RoRo Tourist')).not.toBeChecked();
    expect(screen.getByLabelText('Not present')).toBeChecked();
    expect(screen.getByLabelText('Present')).not.toBeChecked(); // this is reset to 'not' when 'has no' is selected
  });

  // it('should store selection to localstorage when apply filters button is clicked', async () => {
  //   fireEvent.click(screen.getByLabelText('RoRo accompanied freight'));
  //   fireEvent.click(screen.getByLabelText('Present'));
  //   fireEvent.click(screen.getByText('Apply filters'));

  //   expect(localStorage.getItem('filters')).toBe('true,RORO_ACCOMPANIED_FREIGHT');
  // });

  it('should clear filters when clearAll is clicked', async () => {
    // localStorage.setItem('filters', 'true,RORO_ACCOMPANIED_FREIGHT');

    fireEvent.click(screen.getByText('Clear all filters'));

    expect(screen.getByLabelText('RoRo unaccompanied freight')).not.toBeChecked();
    expect(screen.getByLabelText('RoRo accompanied freight')).not.toBeChecked();
    expect(screen.getByLabelText('RoRo Tourist')).not.toBeChecked();
    expect(screen.getByLabelText('Not present')).not.toBeChecked();
    expect(screen.getByLabelText('Present')).not.toBeChecked();
    // expect(localStorage.getItem('filters')).toBeFalsy();
  });

  // it('should persist filters when they exist in local storage', async () => {
  //   localStorage.setItem('filters', 'RORO_ACCOMPANIED_FREIGHT');

  //   expect(screen.getByLabelText('RoRo unaccompanied freight')).not.toBeChecked();
  //   expect(screen.getByLabelText('RoRo Tourist')).not.toBeChecked();
  //   expect(screen.getByLabelText('Not present')).not.toBeChecked();
  //   expect(screen.getByLabelText('Present')).not.toBeChecked();
  //   expect(localStorage.getItem('filters')).toBe('RORO_ACCOMPANIED_FREIGHT');
  // });
});

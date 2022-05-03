import React from 'react';
import { render, screen } from '@testing-library/react';

import TaskListCard from '../TaskLists/TaskListCard';
import targetTask from '../__fixtures__/targetListData';

describe('TaskListCard', () => {
  const airlineCodesMin = [
    {
      name: 'British Airways',
      twolettercode: 'BA',
    },
  ];

  it('should render the task list card for a target task', () => {
    render(<TaskListCard targetTask={targetTask} airlineCodes={airlineCodesMin} />);
    expect(screen.getByText('Single passenger')).toBeInTheDocument();
    expect(screen.getByText('DC')).toBeInTheDocument();
    expect(screen.getByText('British Airways, flight BA103, arrival Unknown')).toBeInTheDocument();
    expect(screen.getByText('BA103')).toBeInTheDocument();
    expect(screen.getByText(/7 Aug 2020/)).toBeInTheDocument();
    expect(screen.getAllByText(/FRA/)).toHaveLength(2);
    expect(screen.getAllByText('LHR')).toHaveLength(2);

    expect(screen.getAllByText(/Passenger/i)).toHaveLength(3);
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('Co-travellers')).toBeInTheDocument();
    expect(screen.getByText('Route')).toBeInTheDocument();

    expect(screen.getByText(/FORD/)).toBeInTheDocument();
    expect(screen.getByText(/Isaiah/)).toBeInTheDocument();
    expect(screen.getByText(/Male/)).toBeInTheDocument();
    expect(screen.getByText(/13 May 1966/)).toBeInTheDocument();
    expect(screen.getByText('Route')).toBeInTheDocument();
    expect(screen.getByText(/1 checked bag/)).toBeInTheDocument();
    expect(screen.getByText(/Valid from Unknown/)).toBeInTheDocument();
    expect(screen.getByText(/Expires Unknown/)).toBeInTheDocument();
    expect(screen.getByText(/Issued by Unknown/)).toBeInTheDocument();
  });
});

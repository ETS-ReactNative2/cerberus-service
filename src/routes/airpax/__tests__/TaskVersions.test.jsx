import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskVersions from '../TaskDetails/TaskVersions';

import taskDetailsData from '../__fixtures__/taskData_AirPax_TaskDetails.fixture.json';
import airlineCodes from '../__fixtures__/taskData_Airpax_AirlineCodes.json';

describe('TaskVersions', () => {
  const mockTaskVersionsWithRuleThreat = [
    {
      number: 1,
      createdAt: '2022-04-20T12:17:45.259425Z',
      movement: {},
      risks: {
        targetingIndicators: {},
        matchedRules: [],
        matchedSelectorGroups: {},
        highestThreatLevel: {
          type: 'RULE',
          value: 'Tier 4',
        },
      },
    },
  ];

  const mockTaskVersionsWithSelectorThreat = [
    {
      number: 2,
      createdAt: '2022-05-20T10:26:03.232421Z',
      movement: {},
      risks: {
        targetingIndicators: {},
        matchedRules: [],
        matchedSelectorGroups: {},
        highestThreatLevel: {
          type: 'SELECTOR',
          value: 'A',
        },
      },
    },
  ];

  const mockTaskVersionsWithNoThreat = [
    {
      number: 2,
      createdAt: '2022-05-20T10:26:03.232421Z',
      movement: {},
      risks: {
        targetingIndicators: {},
        matchedRules: [],
        matchedSelectorGroups: {},
        highestThreatLevel: null,
      },
    },
    {
      number: 3,
      createdAt: '2022-05-20T10:26:03.232421Z',
      movement: {},
      risks: {
        targetingIndicators: {},
        matchedRules: [],
        matchedSelectorGroups: {},
        highestThreatLevel: null,
      },
    },
  ];

  it('should render task versions and rule threat level', () => {
    render(<TaskVersions taskVersions={mockTaskVersionsWithRuleThreat} airlineCodes={airlineCodes} />);
    expect(screen.getByText('Version 1 (latest)')).toBeInTheDocument();
    expect(screen.getByText('Tier 4')).toBeInTheDocument();
  });

  it('should render task versions and selector threat level', () => {
    render(<TaskVersions taskVersions={mockTaskVersionsWithSelectorThreat} airlineCodes={airlineCodes} />);
    expect(screen.getByText('Version 2 (latest)')).toBeInTheDocument();
    expect(screen.getByText('Category A')).toBeInTheDocument();
  });

  it('should render task versions with no rule matches text', () => {
    render(<TaskVersions taskVersions={mockTaskVersionsWithNoThreat} airlineCodes={airlineCodes} />);
    expect(screen.getByText('Version 2 (latest)')).toBeInTheDocument();
    expect(screen.getAllByText('No rule matches')).toHaveLength(2);
  });

  it('should render the document section from version', () => {
    render(<TaskVersions taskVersions={[taskDetailsData.versions[0]]} airlineCodes={airlineCodes} />);
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Number')).toBeInTheDocument();
    expect(screen.getByText('Document nationality')).toBeInTheDocument();
    expect(screen.getByText('Country of issue')).toBeInTheDocument();
    expect(screen.getByText('Valid from')).toBeInTheDocument();
  });

  it('should render the booking section from version', () => {
    render(<TaskVersions taskVersions={[taskDetailsData.versions[0]]} airlineCodes={airlineCodes} />);
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('Reference')).toBeInTheDocument();
    expect(screen.getByText('LSV4UV')).toBeInTheDocument();
    expect(screen.getByText('Number of travellers')).toBeInTheDocument();
    expect(screen.getByText('Booking type')).toBeInTheDocument();
    expect(screen.getByText('Booking country')).toBeInTheDocument();
    expect(screen.getByText('Ticket number')).toBeInTheDocument();
    expect(screen.getByText('Ticket type')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.queryAllByText(/Credit card ending X63X, expiry 10\/20/)).toHaveLength(2);
    expect(screen.getByText('Agent IATA')).toBeInTheDocument();
    expect(screen.getByText('Agent location')).toBeInTheDocument();
  });
});

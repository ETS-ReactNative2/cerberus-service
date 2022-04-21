import { screen, render } from '@testing-library/react';

import { buildSecondSection, buildThirdSection, buildFourthSection, toZoneTimeDifference } from '../../../TaskListPage/airpax/TaskListSectionBuilder';

import { targetTask, targetTaskZoneTimeDiference } from '../../../__fixtures__/targetListData_AirPax';

describe('TaskListSectionBuilder', () => {
  it('should render the second section', () => {
    render(buildSecondSection(targetTask));
    expect(screen.getByText('Single passenger')).toBeInTheDocument();
    expect(screen.getByText('DC')).toBeInTheDocument();
    expect(screen.getByText('British Airways, flight BA103, arrival Unknown')).toBeInTheDocument();
    expect(screen.getByText('BA103')).toBeInTheDocument();
    expect(screen.getByText(/7 Aug 2020/)).toBeInTheDocument();
    expect(screen.getByText('FRA')).toBeInTheDocument();
    expect(screen.getByText('LHR')).toBeInTheDocument();
  });

  it('should render the third section headers', () => {
    render(buildThirdSection(targetTask));
    expect(screen.getByText('Passenger')).toBeInTheDocument();
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('Co-travellers')).toBeInTheDocument();
    expect(screen.getByText('Route')).toBeInTheDocument();
  });

  it('should render the third section contents', () => {
    render(buildThirdSection(targetTask));
    expect(screen.getByText(/FORD/)).toBeInTheDocument();
    expect(screen.getByText(/Isaiah/)).toBeInTheDocument();
    expect(screen.getByText(/Male/)).toBeInTheDocument();
    expect(screen.getByText(/13 May 1966/)).toBeInTheDocument();
    expect(screen.getByText('Route')).toBeInTheDocument();
    expect(screen.getByText(/1 checked bag\(s\)/)).toBeInTheDocument();
    expect(screen.getByText(/Valid from Unknown/)).toBeInTheDocument();
    expect(screen.getByText(/Expires Unknown/)).toBeInTheDocument();
    expect(screen.getByText(/Issued by Unknown/)).toBeInTheDocument();
    expect(screen.queryByText(/FRA/)).toBeInTheDocument();
    expect(screen.getByText(/LHR/)).toBeInTheDocument();
  });

  it('should render the fourth section', () => {
    render(buildFourthSection(targetTask));
    expect(screen.getByText(/Risk Score: 60/)).toBeInTheDocument();
    expect(screen.getByText('2 indicators')).toBeInTheDocument();
    expect(screen.getByText('Quick turnaround freight (under 24 hours)')).toBeInTheDocument();
    expect(screen.getByText('Quick turnaround tourist (under 24 hours)')).toBeInTheDocument();
    expect(screen.getByText('View details')).toBeInTheDocument();
  });
});

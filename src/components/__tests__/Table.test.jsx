import React from 'react';
import { render, screen } from '@testing-library/react';
import Table from '../Table';

describe('Table', () => {
  test('shows an empty table', () => {
    const headings = [];
    const rows = [];

    render(<Table headings={headings} rows={rows} />);

    const tableText = screen.getByRole('table').textContent;

    expect(tableText).toEqual('');
  });

  test('shows a table with one header and one row', () => {
    const headings = ['abc'];
    const rows = [['def']];

    render(<Table headings={headings} rows={rows} />);

    const headerText = screen.getByRole('columnheader').textContent;
    const cellText = screen.getByRole('cell').textContent;

    expect(headerText).toEqual(headings[0]);
    expect(cellText).toContain(headings[0]);
    expect(cellText).toContain(rows[0][0]);
  });

  test('shows a table with one header and multiple rows', () => {
    const headings = ['abc'];
    const rows = [['def'], ['ghi']];

    render(<Table headings={headings} rows={rows} />);

    const headerText = screen.getByRole('columnheader').textContent;
    const cells = screen.getAllByRole('cell');

    expect(cells.length).toEqual(2);

    expect(headerText).toEqual(headings[0]);

    expect(cells[0].textContent).toContain(headings[0]);
    expect(cells[0].textContent).toContain(rows[0][0]);
    expect(cells[1].textContent).toContain(headings[0]);
    expect(cells[1].textContent).toContain(rows[1][0]);
  });

  test('shows a table with multiple headers and one row', () => {
    const headings = ['abc', 'def'];
    const rows = [['ghi', 'jkl']];

    render(<Table headings={headings} rows={rows} />);

    const headers = screen.getAllByRole('columnheader');
    const cells = screen.getAllByRole('cell');

    expect(headers.length).toEqual(2);
    expect(cells.length).toEqual(2);

    expect(headers[0].textContent).toEqual(headings[0]);
    expect(headers[1].textContent).toEqual(headings[1]);

    expect(cells[0].textContent).toContain(headings[0]);
    expect(cells[0].textContent).toContain(rows[0][0]);
    expect(cells[1].textContent).toContain(headings[1]);
    expect(cells[1].textContent).toContain(rows[0][1]);
  });
});

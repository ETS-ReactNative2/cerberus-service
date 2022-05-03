import React from 'react';

import './__assets__/Table.scss';

const Table = ({ headings, rows }) => {
  return (
    <table role="table" className="hods-table">
      <thead className="hods-table__heading">
        <tr role="row">
          {headings.map((header, index) => (
            <th key={index} role="columnheader" scope="col">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="hods-table__body">
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} role="row" className="hods-table__row">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} role="cell" className="hods-table__cell">
                <span className="hods-table__heading">
                  {headings[cellIndex]}
                </span>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;

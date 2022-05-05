import React from 'react';
import renderer from 'react-test-renderer';

import Document from '../../TaskDetails/builder/Document';
import taskDetailsData from '../../__fixtures__/taskData_AirPax_TaskDetails.fixture.json';

describe('Document', () => {
  it('should render the document component', () => {
    const tree = renderer.create(<Document version={taskDetailsData.versions[1]} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

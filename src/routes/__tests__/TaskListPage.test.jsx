import React from 'react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TaskListPage from '../TaskLists/TaskListPage';

describe('TaskListPage', () => {
  const mockAxios = new MockAdapter(axios);
  const envUrl = `${window.location.protocol}//${window.location.hostname}`;
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    mockAxios.reset();
  });

  it('should render loading spinner on component load', () => {
    render(<TaskListPage taskStatus="new" setError={() => { }} />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('should render no tasks available message when New, In Progress, Target Issued and Complete tabs are clicked and there are no tasks', async () => {
    mockAxios
      .onGet('/task')
      .reply(200, [])
      .onGet('/task/count')
      .reply(200, { count: 0 })
      .onGet('/process-instance')
      .reply(200, [])
      .onGet('/process-instance/count')
      .reply(200, { count: 0 })
      .onGet('/variable-instance')
      .reply(200, []);

    await waitFor(() => render(<TaskListPage taskStatus="new" setError={() => { }} />));

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Target issued')).toBeInTheDocument();

    expect(screen.getByText('No tasks available')).toBeInTheDocument();
    expect(screen.queryByText('Request failed with status code 404')).not.toBeInTheDocument();
    expect(screen.queryByText('There is a problem')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /Target issued/i }));
    await waitFor(() => expect(screen.getByText('No tasks available')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText('Request failed with status code 404')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText('There is a problem')).not.toBeInTheDocument());
  });

  it('should render links to processId with text of businessKey when tasks exist', async () => {
    mockAxios
      .onGet('/task/count')
      .reply(200, { count: 0 })
      .onGet('/task')
      .reply(200, [{}])
      .onGet('/process-instance/count')
      .reply(200, { count: 10 })
      .onGet('/process-instance')
      .reply(200, [
        { id: '123' },
        { id: '456' },
        { id: '789' },
      ])
      .onGet('/variable-instance')
      .reply(200, [
        { processInstanceId: '123', type: 'Json', value: '{"businessKey":"abc"}' },
        { processInstanceId: '456', type: 'Json', value: '{"businessKey":"def"}' },
        { processInstanceId: '789', type: 'Json', value: '{"businessKey":"ghi"}' },
      ]);

    await waitFor(() => render(<TaskListPage taskStatus="new" setError={() => { }} />));

    await waitFor(() => expect(screen.getByRole('link', { name: /abc/i }).href).toBe(`${envUrl}/tasks/123`));
    await waitFor(() => expect(screen.getByRole('link', { name: /def/i }).href).toBe(`${envUrl}/tasks/456`));
    await waitFor(() => expect(screen.getByRole('link', { name: /ghi/i }).href).toBe(`${envUrl}/tasks/789`));

    fireEvent.click(screen.getByRole('link', { name: /Target issued/i }));
    await waitFor(() => expect(screen.getByRole('link', { name: /abc/i }).href).toBe(`${envUrl}/tasks/123`));
    await waitFor(() => expect(screen.getByRole('link', { name: /def/i }).href).toBe(`${envUrl}/tasks/456`));
    await waitFor(() => expect(screen.getByRole('link', { name: /ghi/i }).href).toBe(`${envUrl}/tasks/789`));
  });

  it('should render new tasks on page load with a Claim button', async () => {
    mockAxios
      .onGet('/task/count')
      .reply(200, { count: 10 })
      .onGet('/task')
      .reply(200, [
        { processInstanceId: '123' },
        { processInstanceId: '456' },
        { processInstanceId: '789' },
      ])
      .onGet('/variable-instance')
      .reply(200, [
        { processInstanceId: '123', type: 'Json', value: '{"mode":"TestValue"}' },
        { processInstanceId: '456', type: 'Json', value: '{"mode":"TestValue"}' },
        { processInstanceId: '789', type: 'Json', value: '{"mode":"TestValue"}' },
      ]);

    await waitFor(() => render(<TaskListPage taskStatus="new" setError={() => { }} />));

    expect(screen.getAllByText('Claim')).toHaveLength(3);
  });

  it('should render issued tasks with no claim buttons', async () => {
    mockAxios
      .onGet('/task/count')
      .reply(200, { count: 0 })
      .onGet('/task')
      .reply(200, [{}])
      .onGet('/process-instance/count')
      .reply(200, { count: 10 })
      .onGet('/process-instance')
      .reply(200, [
        { id: '123' },
        { id: '456' },
        { id: '789' },
      ])
      .onGet('/variable-instance')
      .reply(200, [
        { processInstanceId: '123', type: 'Json', value: '{"businessKey":"abc"}' },
        { processInstanceId: '456', type: 'Json', value: '{"businessKey":"def"}' },
        { processInstanceId: '789', type: 'Json', value: '{"businessKey":"ghi"}' },
      ]);

    await waitFor(() => render(<TaskListPage taskStatus="new" setError={() => { }} />));
    fireEvent.click(screen.getByRole('link', { name: /Target issued/i }));

    await waitFor(() => expect(screen.getByText('Target issued tasks')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText('Claim')).not.toBeInTheDocument());
  });

  it('should handle errors gracefully', async () => {
    mockAxios
      .onGet('/task/count')
      .reply(200, { count: 10 })
      .onGet('/task')
      .reply(500);

    await waitFor(() => render(<TaskListPage taskStatus="new" setError={() => { }} />));

    expect(screen.getByText('No tasks available')).toBeInTheDocument();
    expect(screen.queryByText('Request failed with status code 500')).toBeInTheDocument();
    expect(screen.queryByText('There is a problem')).toBeInTheDocument();
  });
});

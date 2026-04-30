import { useEffect, useState } from 'react';
import api, { extractError } from '../api/client';
import TaskRow from '../components/TaskRow';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/mine');
      setTasks(res.data.data);
      setError(null);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      load();
    } catch (err) { alert(extractError(err)); }
  };

  if (loading) return <div className="center-screen"><div className="spinner" /></div>;

  const open = tasks.filter((t) => t.status !== 'Done');
  const done = tasks.filter((t) => t.status === 'Done');

  return (
    <>
      <div className="title-row">
        <div>
          <h2>My Tasks</h2>
          <div className="subtitle">{open.length} open · {done.length} done</div>
        </div>
      </div>
      {error && <div className="error-msg">{error}</div>}

      <div className="grid grid-2">
        <div className="card">
          <h3>Open</h3>
          {open.length === 0 ? (
            <div className="empty-state">Nothing to do — nice work.</div>
          ) : (
            open.map((t) => (
              <TaskRow key={t._id} task={t} canEdit canDelete={false} onChangeStatus={onStatusChange} />
            ))
          )}
        </div>
        <div className="card">
          <h3>Completed</h3>
          {done.length === 0 ? (
            <div className="empty-state">No completed tasks yet.</div>
          ) : (
            done.map((t) => (
              <TaskRow key={t._id} task={t} canEdit canDelete={false} onChangeStatus={onStatusChange} />
            ))
          )}
        </div>
      </div>
    </>
  );
}

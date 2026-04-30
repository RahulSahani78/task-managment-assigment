import { useEffect, useState } from 'react';
import api, { extractError } from '../api/client';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';

const StatCard = ({ tone, label, value, icon }) => (
  <div className={`card stat-card ${tone}`}>
    <div className="icon-bubble"><Icon name={icon} /></div>
    <div className="label">{label}</div>
    <div className="value">{value}</div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="center-screen"><div className="spinner" /></div>;
  }

  if (error) {
    return <div className="error-msg">{error}</div>;
  }

  if (!stats) return null;

  const completion = stats.total > 0 ? Math.round((stats.byStatus.Done / stats.total) * 100) : 0;

  return (
    <>
      <div className="title-row">
        <div>
          <h2>Overview</h2>
          <div className="subtitle">Across {stats.projectsCount} project{stats.projectsCount === 1 ? '' : 's'} · {completion}% complete</div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 22 }}>
        <StatCard tone="info" icon="tasks" label="Total tasks" value={stats.total} />
        <StatCard tone="purple" icon="dashboard" label="To Do" value={stats.byStatus['To Do'] || 0} />
        <StatCard tone="warning" icon="flag" label="In Progress" value={stats.byStatus['In Progress'] || 0} />
        <StatCard tone="primary" icon="check" label="Done" value={stats.byStatus.Done || 0} />
        <StatCard tone="danger" icon="overdue" label="Overdue" value={stats.overdue} />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Completion</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 6 }}>
            <div style={{ flex: 1 }}>
              <div className="muted" style={{ marginBottom: 6 }}>{stats.byStatus.Done || 0} of {stats.total} tasks done</div>
              <div className="progress-bar"><div className="fill" style={{ width: `${completion}%` }} /></div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>{completion}%</div>
          </div>
          <div className="row" style={{ gap: 16, marginTop: 18, fontSize: '0.85rem' }}>
            <span><span className="badge badge-todo">To Do</span> {stats.byStatus['To Do'] || 0}</span>
            <span><span className="badge badge-progress">In Progress</span> {stats.byStatus['In Progress'] || 0}</span>
            <span><span className="badge badge-done">Done</span> {stats.byStatus.Done || 0}</span>
          </div>
        </div>

        <div className="card">
          <h3>Tasks per user</h3>
          {stats.byUser.length === 0 ? (
            <div className="muted">No tasks yet.</div>
          ) : (
            <table className="simple">
              <thead>
                <tr><th>User</th><th>Total</th><th>Done</th><th>Open</th></tr>
              </thead>
              <tbody>
                {stats.byUser.map((u) => {
                  const pct = u.count ? Math.round((u.done / u.count) * 100) : 0;
                  return (
                    <tr key={u._id || 'unassigned'}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={u.name} size="sm" />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            {u.email && <div className="muted" style={{ fontSize: '0.75rem' }}>{u.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td>{u.count}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{u.done}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{u.count - u.done}</span>
                          <div className="progress-bar" style={{ flex: 1, maxWidth: 80 }}>
                            <div className="fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

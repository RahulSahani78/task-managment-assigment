import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { extractError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
      setError(null);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setCreateError(null);
    try {
      await api.post('/projects', form);
      setShowCreate(false);
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      setCreateError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const myRole = (project) => project.members.find((x) => x.user._id === user._id)?.role;

  return (
    <>
      <div className="title-row">
        <div>
          <h2>Projects</h2>
          <div className="subtitle">{projects.length} project{projects.length === 1 ? '' : 's'} you're part of</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Icon name="plus" size={16} /> New project
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="center-screen"><div className="spinner" /></div>
      ) : projects.length === 0 ? (
        <div className="card empty-state">
          <p style={{ marginBottom: 14 }}>You don't belong to any projects yet.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Icon name="plus" size={16} /> Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-projects">
          {projects.map((p) => (
            <Link to={`/projects/${p._id}`} key={p._id} className="card interactive project-card">
              <div className="row between">
                <h3>{p.name}</h3>
                <span className={myRole(p) === 'Admin' ? 'badge badge-admin' : 'badge badge-member'}>
                  {myRole(p)}
                </span>
              </div>
              {p.description && <p className="desc">{p.description}</p>}
              <div className="footer">
                <div className="avatar-stack">
                  {p.members.slice(0, 4).map((m) => (
                    <Avatar key={m.user._id} name={m.user.name} size="sm" title={m.user.name} />
                  ))}
                  {p.members.length > 4 && (
                    <span className="avatar sm" title={`+${p.members.length - 4} more`}>+{p.members.length - 4}</span>
                  )}
                </div>
                <span>by {p.createdBy?.name?.split(' ')[0]}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Create project" onClose={() => setShowCreate(false)}>
          <form onSubmit={onCreate}>
            {createError && <div className="error-msg">{createError}</div>}
            <div className="form-group">
              <label>Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={100}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={1000}
              />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

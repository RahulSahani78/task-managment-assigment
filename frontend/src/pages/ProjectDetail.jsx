import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { extractError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import TaskRow from '../components/TaskRow';
import TaskForm from '../components/TaskForm';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Member');
  const [memberError, setMemberError] = useState(null);

  const [filters, setFilters] = useState({ status: '', priority: '', assignee: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`, { params: filters }),
      ]);
      setProject(pRes.data.data);
      setTasks(tRes.data.data);
      setError(null);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [id, filters]);

  useEffect(() => { load(); }, [load]);

  const myRole = project?.members.find((m) => m.user._id === user._id)?.role;
  const isAdmin = myRole === 'Admin';

  const handleCreateTask = async (data) => {
    try {
      await api.post(`/projects/${id}/tasks`, data);
      setShowTaskForm(false);
      load();
      return { ok: true };
    } catch (err) { return { ok: false, error: extractError(err) }; }
  };

  const handleUpdateTask = async (data) => {
    try {
      await api.put(`/tasks/${editingTask._id}`, data);
      setEditingTask(null);
      load();
      return { ok: true };
    } catch (err) { return { ok: false, error: extractError(err) }; }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      load();
    } catch (err) { alert(extractError(err)); }
  };

  const handleDeleteTask = async (task) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      load();
    } catch (err) { alert(extractError(err)); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError(null);
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole });
      setShowAddMember(false);
      setMemberEmail('');
      setMemberRole('Member');
      load();
    } catch (err) { setMemberError(extractError(err)); }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Remove ${memberName} from this project?`)) return;
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      load();
    } catch (err) { alert(extractError(err)); }
  };

  const handleChangeMemberRole = async (memberId, newRole) => {
    try {
      await api.patch(`/projects/${id}/members/${memberId}`, { role: newRole });
      load();
    } catch (err) { alert(extractError(err)); }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Delete project "${project.name}" and all its tasks?`)) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) { alert(extractError(err)); }
  };

  const canEditTask = (task) => isAdmin || (task.assignee && task.assignee._id === user._id);

  if (loading && !project) {
    return <div className="center-screen"><div className="spinner" /></div>;
  }

  if (error) return <div className="error-msg">{error}</div>;
  if (!project) return null;

  const doneCount = tasks.filter((t) => t.status === 'Done').length;
  const completion = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <>
      <div className="title-row">
        <div>
          <h2>{project.name}</h2>
          <div className="subtitle">
            {project.description || 'No description'}
          </div>
        </div>
        <div className="row">
          <span className={isAdmin ? 'badge badge-admin' : 'badge badge-member'}>{myRole}</span>
          {isAdmin && (
            <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>
              <Icon name="trash" size={14} /> Delete project
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <div className="row between" style={{ marginBottom: 6 }}>
          <strong>Project progress</strong>
          <span className="muted">{doneCount}/{tasks.length} tasks · {completion}%</span>
        </div>
        <div className="progress-bar"><div className="fill" style={{ width: `${completion}%` }} /></div>
      </div>

      <div className="grid grid-2">
        <div>
          <div className="card">
            <div className="row between" style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Tasks ({tasks.length})</h3>
              {isAdmin && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowTaskForm(true)}>
                  <Icon name="plus" size={14} /> New task
                </button>
              )}
            </div>

            <div className="filter-bar">
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All statuses</option>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
              <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                <option value="">All priorities</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}>
                <option value="">All assignees</option>
                {project.members.map((m) => (
                  <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                ))}
              </select>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-state">No tasks yet.</div>
            ) : (
              tasks.map((t) => (
                <TaskRow
                  key={t._id}
                  task={t}
                  canEdit={canEditTask(t)}
                  canDelete={isAdmin}
                  onChangeStatus={handleStatusChange}
                  onEdit={canEditTask(t) ? setEditingTask : null}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <div className="row between" style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Members ({project.members.length})</h3>
              {isAdmin && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddMember(true)}>
                  <Icon name="plus" size={14} /> Add
                </button>
              )}
            </div>
            {project.members.map((m) => (
              <div className="member-row" key={m.user._id}>
                <div className="info">
                  <Avatar name={m.user.name} />
                  <div className="meta">
                    <div className="name">
                      {m.user.name}
                      {m.user._id === user._id && <span className="muted"> (you)</span>}
                    </div>
                    <div className="muted" style={{ fontSize: '0.78rem' }}>{m.user.email}</div>
                  </div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  {isAdmin && m.user._id !== project.createdBy._id ? (
                    <select
                      value={m.role}
                      onChange={(e) => handleChangeMemberRole(m.user._id, e.target.value)}
                      style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem' }}
                    >
                      <option>Admin</option>
                      <option>Member</option>
                    </select>
                  ) : (
                    <span className={m.role === 'Admin' ? 'badge badge-admin' : 'badge badge-member'}>{m.role}</span>
                  )}
                  {isAdmin && m.user._id !== project.createdBy._id && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveMember(m.user._id, m.user.name)}
                      title="Remove"
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(showTaskForm || editingTask) && (
        <Modal
          title={editingTask ? 'Edit task' : 'Create task'}
          onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
        >
          <TaskForm
            initial={editingTask}
            members={project.members}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={() => { setShowTaskForm(false); setEditingTask(null); }}
            submitLabel={editingTask ? 'Save changes' : 'Create task'}
          />
        </Modal>
      )}

      {showAddMember && (
        <Modal title="Add member" onClose={() => setShowAddMember(false)}>
          <form onSubmit={handleAddMember}>
            {memberError && <div className="error-msg">{memberError}</div>}
            <div className="form-group">
              <label>User email *</label>
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                required
                autoFocus
              />
              <div className="muted" style={{ marginTop: 6, fontSize: '0.78rem' }}>
                The user must already have an account.
              </div>
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                <option>Member</option>
                <option>Admin</option>
              </select>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddMember(false)}>Cancel</button>
              <button className="btn btn-primary">Add member</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

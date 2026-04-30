import { useState } from 'react';

const formatDateForInput = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toISOString().split('T')[0];
};

export default function TaskForm({ initial, members, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    status: initial?.status || 'To Do',
    priority: initial?.priority || 'Medium',
    dueDate: formatDateForInput(initial?.dueDate),
    assignee: initial?.assignee?._id || initial?.assignee || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = {
      ...form,
      dueDate: form.dueDate || null,
      assignee: form.assignee || null,
    };
    const result = await onSubmit(payload);
    setSubmitting(false);
    if (!result?.ok) setError(result?.error || 'Failed');
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="error-msg">{error}</div>}
      <div className="form-group">
        <label>Title *</label>
        <input value={form.title} onChange={update('title')} required maxLength={200} />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={form.description} onChange={update('description')} maxLength={2000} />
      </div>
      <div className="row" style={{ gap: 12 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Status</label>
          <select value={form.status} onChange={update('status')}>
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Priority</label>
          <select value={form.priority} onChange={update('priority')}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </div>
      <div className="row" style={{ gap: 12 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Due date</label>
          <input type="date" value={form.dueDate} onChange={update('dueDate')} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Assignee</label>
          <select value={form.assignee} onChange={update('assignee')}>
            <option value="">Unassigned</option>
            {members?.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                {m.user.name} ({m.role})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel || 'Save'}
        </button>
      </div>
    </form>
  );
}

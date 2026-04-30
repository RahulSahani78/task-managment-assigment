import { useState } from 'react';
import Avatar from './Avatar';
import Icon from './Icon';

const statusBadge = (s) =>
  ({
    'To Do': 'badge badge-todo',
    'In Progress': 'badge badge-progress',
    Done: 'badge badge-done',
  }[s] || 'badge');

const priorityBadge = (p) =>
  ({
    Low: 'badge badge-low',
    Medium: 'badge badge-medium',
    High: 'badge badge-high',
  }[p] || 'badge');

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : null);

export default function TaskRow({ task, canEdit, canDelete, onChangeStatus, onEdit, onDelete }) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (e) => {
    setUpdating(true);
    await onChangeStatus(task._id, e.target.value);
    setUpdating(false);
  };

  return (
    <div className={`task-row ${task.isOverdue ? 'overdue' : ''}`}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12, alignItems: 'center' }}>
        {task.assignee ? (
          <Avatar name={task.assignee.name} />
        ) : (
          <span className="avatar" title="Unassigned" style={{ opacity: 0.55 }}>?</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4>{task.title}</h4>
          <div className="meta">
            <span className={statusBadge(task.status)}>{task.status}</span>
            <span className={priorityBadge(task.priority)}>{task.priority}</span>
            {task.dueDate && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: task.isOverdue ? 'var(--danger)' : undefined }}>
                <Icon name="calendar" size={13} />
                {formatDate(task.dueDate)}
                {task.isOverdue ? ' · overdue' : ''}
              </span>
            )}
            {task.project?.name && <span>· {task.project.name}</span>}
          </div>
        </div>
      </div>
      <div className="actions">
        {canEdit && (
          <select
            value={task.status}
            disabled={updating}
            onChange={handleStatusChange}
            style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem' }}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        )}
        {onEdit && (
          <button className="btn btn-sm" onClick={() => onEdit(task)} title="Edit">
            <Icon name="edit" size={14} />
          </button>
        )}
        {canDelete && (
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(task)} title="Delete">
            <Icon name="trash" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

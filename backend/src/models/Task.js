const mongoose = require('mongoose');

const TASK_STATUS = ['To Do', 'In Progress', 'Done'];
const TASK_PRIORITY = ['Low', 'Medium', 'High'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title too long'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description too long'],
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: TASK_STATUS,
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: TASK_PRIORITY,
      default: 'Medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'Done') return false;
  return this.dueDate.getTime() < Date.now();
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
module.exports.TASK_STATUS = TASK_STATUS;
module.exports.TASK_PRIORITY = TASK_PRIORITY;

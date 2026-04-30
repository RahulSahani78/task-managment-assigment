const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Member'],
      default: 'Member',
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Name too long'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description too long'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: {
      type: [memberSchema],
      default: [],
    },
  },
  { timestamps: true }
);

projectSchema.methods.getMemberRole = function (userId) {
  const m = this.members.find((x) => x.user.toString() === userId.toString());
  return m ? m.role : null;
};

projectSchema.methods.isAdmin = function (userId) {
  return this.getMemberRole(userId) === 'Admin';
};

projectSchema.methods.isMember = function (userId) {
  return this.getMemberRole(userId) !== null;
};

module.exports = mongoose.model('Project', projectSchema);

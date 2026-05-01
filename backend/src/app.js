const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

// ✅ Allowed origins from env
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// ✅ CORS setup (safe + flexible)
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Postman / mobile

      // अगर env empty है → allow all (safe fallback for deploy)
      if (allowedOrigins.length === 0) {
        return cb(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      return cb(new Error('CORS blocked: ' + origin));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
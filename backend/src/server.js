require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    // ✅ Railway FIX (VERY IMPORTANT)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

  } catch (error) {
    console.error('Server start failed:', error);
    process.exit(1);
  }
};

start();

// Handle unhandled errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
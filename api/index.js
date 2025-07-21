const path = require('path');

// Set environment variable for Vercel runtime
process.env.RUNTIME = 'vercel';

try {
  const distPath = path.join(__dirname, '..', 'dist', 'index.js');
  const app = require(distPath);

  // Export the app for Vercel
  module.exports = app.default || app;
} catch (error) {
  console.error('Failed to load application:', error);

  // Fallback handler for debugging
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Application failed to load',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  };
}

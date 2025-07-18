const path = require('path');

// Set environment variable for Vercel runtime
process.env.RUNTIME = 'vercel';

const distPath = path.join(__dirname, '..', 'dist', 'index.js');
const app = require(distPath);

module.exports = app.default || app;

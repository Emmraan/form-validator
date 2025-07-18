// Vercel serverless function entry point
const path = require('path');

// Ensure the dist directory is accessible
const distPath = path.join(__dirname, '..', 'dist', 'index.js');
const app = require(distPath);

// Handle both ES modules and CommonJS exports
module.exports = app.default || app;

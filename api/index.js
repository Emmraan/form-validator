const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'index.js');
const app = require(distPath);

module.exports = app.default || app;

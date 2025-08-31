const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env from current working directory
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Use all process.env variables automatically
module.exports = {
  apps: [{
    name: 'hookly-api',
    script: './dist/src/main.js',
    instances: 1,
    exec_mode: 'fork',
    env: { ...process.env }, // <-- automatically include everything from .env
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 10000,
    kill_timeout: 5000
  }]
};

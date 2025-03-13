const fs = require('fs');
const path = './dist/main.worker.js';

if (!fs.existsSync(path)) {
  console.error("⚠️ Worker file not found:", path);
  process.exit(1);
}

module.exports = {
  apps: [
    {
      name: "queue-worker",
      script: path,
      watch: false,
      autorestart: true,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

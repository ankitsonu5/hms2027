/**
 * PM2 process file for the server.
 *
 * One Node process on port 4045 serves both the REST API (/api/v1/...) and the
 * Angular app — the frontend builds into backend/client and ServeStaticModule
 * serves it, so there is no separate frontend server.
 *
 * Deploy / update:
 *   cd frontend && npm ci && npm run build      # -> backend/client
 *   cd ../backend && npm ci && npm run build    # -> backend/dist
 *   cd .. && pm2 start ecosystem.config.js      # first time
 *           pm2 reload ecosystem.config.js      # every deploy after that
 */
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'hms',
      // Absolute, so it works wherever pm2 is invoked from. It must be backend/:
      // ConfigModule loads `.env` relative to the working directory.
      cwd: path.join(__dirname, 'backend'),
      script: 'dist/main.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      // PM2's env wins over backend/.env, so the port lives here only.
      env: {
        PORT: '4045',
      },
    },
  ],
};

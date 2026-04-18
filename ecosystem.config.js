module.exports = {
  apps: [
    {
      name: 'hdncare-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'hdncare-client',
      cwd: './',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 5173 --strictPort',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'hdncare-admin',
      cwd: './admin',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 5174 --strictPort',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

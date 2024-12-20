module.exports = {
  apps: [
    {
      name: 'neon-chat',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/html/project9',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_NEO_API_ENDPOINT: '/project9/api/neo'
      },
    },
  ],
};
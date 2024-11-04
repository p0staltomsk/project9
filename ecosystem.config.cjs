module.exports = {
  apps : [{
    name: "project9",
    script: "serve",
    env: {
      PM2_SERVE_PATH: "/var/www/html/project9/",
      PM2_SERVE_PORT: 3000,
      PM2_SERVE_SPA: "true",
      PM2_SERVE_HOMEPAGE: "/index.tsx"
    }
  }]
};
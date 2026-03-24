module.exports = {
  apps: [
    {
      name: "uberfix",
      cwd: "/var/www/core/UberFix.shop",

      script: "npm",
      args: "run preview -- --host --port 5173",

      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

      env: {
        NODE_ENV: "production",
        PORT: 5173
      },

      error_file: "/var/log/pm2/uberfix-error.log",
      out_file: "/var/log/pm2/uberfix-out.log",
      log_file: "/var/log/pm2/uberfix-combined.log",
      time: true
    }
  ]
};

module.exports = {
  apps: [{
    name: 'owl-backend',
    script: './src/app.js',
    instances: 1,
    exec_mode: 'fork',

    // 环境变量
    env: {
      NODE_ENV: 'production',
      PORT: 5002
    },

    // 开发环境
    env_development: {
      NODE_ENV: 'development',
      PORT: 3001
    },

    // 日志配置
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // 自动重启配置
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_memory_restart: '500M',

    // 崩溃重启
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',

    // 优雅退出
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
  }]
};
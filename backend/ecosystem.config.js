module.exports = {
    apps: [{
        name: 'taufiq-store-backend',
        script: './src/index.js',
        instances: process.env.PM2_INSTANCES || 2,  // Cluster mode with 2 instances
        exec_mode: 'cluster',

        // Auto restart configuration
        autorestart: true,
        watch: false,  // Disable watch in production for performance
        max_memory_restart: '512M',  // Auto-restart if memory > 512MB

        // Environment variables
        env: {
            NODE_ENV: 'development',
            PORT: 3000
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        },

        // Logging configuration
        error_file: './logs/error.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

        // Restart and uptime limits
        max_restarts: 10,  // Max 10 restarts in min_uptime period
        min_uptime: '10s',  // Minimum uptime before considering stable

        // Graceful shutdown configuration
        kill_timeout: 5000,  // Wait 5s before force kill
        wait_ready: true,  // Wait for ready signal
        listen_timeout: 10000,  // Wait 10s for app to start listening

        // Error handling - exponential backoff for restarts
        exp_backoff_restart_delay: 100,

        // Monitoring
        instance_var: 'INSTANCE_ID'  // Environment variable for instance ID
    }]
};

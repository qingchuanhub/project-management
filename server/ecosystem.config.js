module.exports = {
  apps: [
    {
      name: 'projectflow',
      script: 'index.js',
      cwd: 'C:/projectflow/server',
      env: {
        PORT: 3000,
        DIST_DIR: 'C:/projectflow/public'
      }
    }
  ]
}

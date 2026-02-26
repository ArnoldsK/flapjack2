/** PM2 ecosystem file. Run after: pnpm build */
module.exports = {
  apps: [
    {
      name: "flapjack-app",
      cwd: __dirname,
      script: "app/dist/app/src/index.js",
      interpreter: "node",
      env: { NODE_ENV: "production" },
    },
    {
      name: "flapjack-web",
      cwd: __dirname,
      script: "npx",
      args: "serve web/dist -l 5173",
      interpreter: "node",
      env: { NODE_ENV: "production" },
    },
  ],
};

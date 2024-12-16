module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run start",
      watch: ["./frontend"],
      ignore_watch: ["node_modules", "logs"],
      env: {
        PORT: 80,
      },
    },
    {
      name: "backend",
      cwd: "./backend",
      script: "npm",
      args: "run start:prod",
      watch: ["./backend"],
      env: {
        PORT: 3001,
      },
    },
    {
      name: "contract",
      cwd: "./contract",
      script: "npx",
      args: "hardhat node",
      env: {
        PORT: 8545,
      },
    },
  ],
};

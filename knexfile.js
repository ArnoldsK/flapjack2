const path = require("path");

module.exports = {
  client: "mysql2",
  migrations: {
    directory: path.join(__dirname, "db", "migrations"),
    stub: path.join(__dirname, "db", "migration-stub.js"),
    loadExtensions: [".js"],
  },
};

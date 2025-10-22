const { Router } = require("express");

const routes = new Router();

routes.get("/health", (req, res) => {
  res.send("Server is healthy");
});

module.exports = routes;

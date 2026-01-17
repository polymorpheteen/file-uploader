const { Router } = require("express");
const { createUser } = require("../services/userService");

const registerRouter = Router();

registerRouter.get("/register", (req, res) => {
  res.render("register");
});

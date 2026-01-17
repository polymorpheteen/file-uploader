import { Router } from "express";
import { createUser } from "../services/userService.js";

const registerRouter = Router();

registerRouter.get("/", (req, res) => {
  res.render("register", { error: null });
});

registerRouter.post("/", async (req, res) => {
  const { email, password, confirmPassword, name } = req.body;

  if (password !== confirmPassword) {
    return res.render("register", { error: "Passwords do not match!" });
  }

  try {
    await createUser(email, password, name);
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.render("register", { error: "Registration failed. Please try again." });
  }
});

export default registerRouter;

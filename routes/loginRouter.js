import { Router } from "express";
import passport from "../auth/passport.js";

const loginRouter = Router();

loginRouter.get("/", (req, res) => {
  res.render("login");
});

loginRouter.post("/", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err); // Handle errors
    }
    if (!user) {
      return res.redirect("/login"); // If user is not found, stay on login page
    }

    // Manually log the user in
    req.login(user, (err) => {
      if (err) {
        return next(err); // Handle login errors
      }
      return res.redirect("/dashboard"); // Redirect to dashboard on success
    });
  })(req, res, next);
});

export default loginRouter;

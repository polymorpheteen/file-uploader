import { Router } from "express";

const dashboardRouter = Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

dashboardRouter.get("/", ensureAuthenticated, (req, res) => {
  console.log("User is authenticated:", req.user);
  res.render("dashboard", {
    user: req.user,
  });
});

export default dashboardRouter;

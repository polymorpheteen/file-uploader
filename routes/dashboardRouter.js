import { showCurrentDirectory } from "../controllers/dashboardController.js";
import { Router } from "express";

const dashboardRouter = Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

dashboardRouter.get("/", ensureAuthenticated, showCurrentDirectory);

dashboardRouter.get("/:folderId", ensureAuthenticated, showCurrentDirectory);

export default dashboardRouter;

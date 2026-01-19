import { createNewFolder } from "../controllers/foldersController.js";
import { Router } from "express";

const foldersRouter = Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect("/login");
}

foldersRouter.post("/", ensureAuthenticated, createNewFolder);

export default foldersRouter;

import { removeFiles, getFilesInfo, downloadFile } from "../controllers/filesController.js";
import { Router } from "express";

const filesRouter = Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();

  if (req.headers.accept?.includes("application/json")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.redirect("/login");
}

filesRouter.delete("/:id", ensureAuthenticated, removeFiles);

filesRouter.get("/:id/info", ensureAuthenticated, getFilesInfo);
filesRouter.get("/:id/download", ensureAuthenticated, downloadFile);

export default filesRouter;

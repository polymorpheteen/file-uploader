import { Router } from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadFiles } from "../controllers/uploadController.js";

const uploadRouter = Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

uploadRouter.post("/", ensureAuthenticated, upload.array("files"), uploadFiles);

export default uploadRouter;

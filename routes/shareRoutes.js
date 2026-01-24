import { Router } from "express";
import { viewSharedFolder } from "../controllers/shareController.js";

const shareRouter = Router();

shareRouter.get("/:token", viewSharedFolder);

export default shareRouter;
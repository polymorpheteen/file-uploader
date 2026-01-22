import { Router } from "express";
import { createNewUsers } from "../controllers/registerController.js";

const registerRouter = Router();

registerRouter.get("/", (req, res) => {
  res.render("register", { error: null });
});

registerRouter.post("/", createNewUsers);

export default registerRouter;

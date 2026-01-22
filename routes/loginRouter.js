import { Router } from "express";
import { authenticateUsers } from "../controllers/loginControllers.js";

const loginRouter = Router();

loginRouter.get("/", (req, res) => {
  res.render("login");
});

loginRouter.post("/", authenticateUsers);

export default loginRouter;

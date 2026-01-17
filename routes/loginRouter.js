import { Router } from "express";

const loginRouter = Router();

loginRouter.get("/", (req, res) => {
  res.send("You've registered!");
});

export default loginRouter;

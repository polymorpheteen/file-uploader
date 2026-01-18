import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import session from "express-session";
import passport from "./auth/passport.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { prisma } from "./lib/prisma.js";

import registerRouter from "./routes/registerRouter.js";
import loginRouter from "./routes/loginRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";
import logoutRouter from "./routes/logoutRouter.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 24,
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/dashboard", dashboardRouter);
app.use("/logout", logoutRouter);

app.get("/", (req, res) => {
  res.redirect("/register");
});

const PORT = 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`My first Express app - listening on port ${PORT}!`);
});

import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

export default function configureLocalStrategy(passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            return done(null, false, { message: "Invalid email" });
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid password" });
          }

          return done(null, user);
        } catch (err) {
          return err;
        }
      },
    ),
  );
}

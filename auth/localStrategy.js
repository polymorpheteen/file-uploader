const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { prisma } = require("../lib/prisma");

module.exports = function LocalStrategy(passport) {
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
};

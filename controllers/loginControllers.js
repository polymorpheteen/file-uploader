import passport from "../auth/passport.js";

export async function authenticateUsers(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect("/login");

    // Important: call req.login with full user object
    req.login(user, (err) => {
      if (err) return next(err);

      // Explicitly save the session to ensure persistence behind Render
      req.session.save((err) => {
        if (err) return next(err);

        console.log("Logged in user:", req.user);
        res.redirect("/dashboard");
      });
    });
  })(req, res, next);
}

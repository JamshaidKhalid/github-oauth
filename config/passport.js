const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const GithubIntegration = require("../models/GithubIntegration.model");

require("dotenv").config();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existing = await GithubIntegration.findOne({ githubId: profile.id });

        if (existing) {
          existing.accessToken = accessToken;
          existing.connectedAt = new Date();
          await existing.save();
          return done(null, existing);
        }

        const user = await GithubIntegration.create({
          githubId: profile.id,
          username: profile.username,
          email: profile.emails?.[0]?.value || "",
          accessToken,
          avatarUrl: profile._json.avatar_url,
          profileUrl: profile.profileUrl
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await GithubIntegration.findById(id);
  done(null, user);
});

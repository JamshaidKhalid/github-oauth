const express = require("express");
const passport = require("passport");
const router = express.Router();
const {
  getIntegrationStatus,
  removeIntegration,
  getGithubCollections,
  queryGithubCollection,
  resyncGithubData,
} = require("../controllers/github.controller");

// GitHub OAuth start
router.get("/auth/github", passport.authenticate("github", { scope: ["user:email", "read:org"] }));

// OAuth callback
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:4200"); // Send to Angular frontend
  }
);

// Status
router.get("/integration/status", getIntegrationStatus);

// Remove
router.delete("/integration/remove", removeIntegration);
router.post("/integration/resync", resyncGithubData);

router.get("/collections", getGithubCollections);
router.post("/data/:collection", queryGithubCollection);

module.exports = router;

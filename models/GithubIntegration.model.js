const mongoose = require("mongoose");

const GithubIntegrationSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String },
  email: { type: String },
  accessToken: { type: String },
  avatarUrl: { type: String },
  profileUrl: { type: String },
  connectedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GithubIntegration", GithubIntegrationSchema, "github-integrations");

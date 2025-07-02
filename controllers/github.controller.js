const GithubIntegration = require("../models/GithubIntegration.model");
const GithubOrganization = require("../models/GithubOrganization.model");
const OrgRepo = require("../models/OrgRepo.model");
const OrgCommit = require("../models/OrgCommit.model");
const OrgPull = require("../models/OrgPull.model");
const OrgIssue = require("../models/OrgIssue.model");
const OrgChangelog = require("../models/OrgChangelog.model");
const OrgUser = require("../models/OrgUser.model");
const { syncOrganizationsAndData } = require("../helpers/github.sync");
const { queryCollection } = require("../helpers/github.query");

const collectionMap = {
  "github-organizations": require("../models/GithubOrganization.model"),
  "org-repos": require("../models/OrgRepo.model"),
  "org-commits": require("../models/OrgCommit.model"),
  "org-pulls": require("../models/OrgPull.model"),
  "org-issues": require("../models/OrgIssue.model"),
  "org-changelogs": require("../models/OrgChangelog.model"),
  "org-users": require("../models/OrgUser.model")
};

exports.getIntegrationStatus = async (req, res) => {
  try {
    const integration = await GithubIntegration.findOne();
    if (!integration) {
      return res.json({ connected: false });
    }
    res.json({
      connected: true,
      username: integration.username,
      connectedAt: integration.connectedAt,
      avatarUrl: integration.avatarUrl,
      profileUrl: integration.profileUrl
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch integration status." });
  }
};


exports.queryGithubCollection = async (req, res) => {
  try {
    const { collection } = req.params;
    const model = collectionMap[collection];

    if (!model) return res.status(400).json({ error: "Invalid collection" });

    const { page, pageSize, sort, filters, search } = req.body;

    const result = await queryCollection({
      model,
      page,
      pageSize,
      sort,
      filters,
      search
    });

    res.json(result);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Failed to query data" });
  }
};

exports.getGithubCollections = async (req, res) => {
  res.json({
    collections: Object.keys(collectionMap)
  });
};

exports.resyncGithubData = async (req, res) => {
  try {
    await syncOrganizationsAndData(); // this will pull data using stored token
    res.json({ message: "GitHub data synced successfully" });
  } catch (err) {
    console.error("❌ Sync error:", err.message);
    res.status(500).json({ error: "Failed to sync GitHub data" });
  }
};

exports.removeIntegration = async (req, res) => {
  try {
    const integration = await GithubIntegration.findOne();
    if (!integration) return res.json({ success: false, message: "No integration found" });

    const integrationId = integration._id;

    // Remove related data
    await Promise.all([
      OrgRepo.deleteMany({ integrationId }),
      OrgCommit.deleteMany({ integrationId }),
      OrgPull.deleteMany({ integrationId }),
      OrgIssue.deleteMany({ integrationId }),
      OrgChangelog.deleteMany({ integrationId }),
      OrgUser.deleteMany({ integrationId }),
      GithubOrganization.deleteMany({ integrationId }),
      GithubIntegration.deleteOne({ _id: integrationId })
    ]);

    res.json({ success: true, message: "Integration and all related data removed" });
  } catch (err) {
    console.error("❌ Removal error:", err.message);
    res.status(500).json({ error: "Failed to remove integration" });
  }
};

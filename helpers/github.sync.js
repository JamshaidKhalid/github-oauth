const axios = require("axios");
const GithubIntegration = require("../models/GithubIntegration.model");

const GithubOrganization = require("../models/GithubOrganization.model");
const OrgRepo = require("../models/OrgRepo.model");
const OrgCommit = require("../models/OrgCommit.model");
const OrgPull = require("../models/OrgPull.model");
const OrgIssue = require("../models/OrgIssue.model");
const OrgChangelog = require("../models/OrgChangelog.model");
const OrgUser = require("../models/OrgUser.model");

const GITHUB_API = "https://api.github.com";

// -------------------------
// Pagination helper
// -------------------------
async function fetchAllFromGitHub(endpoint, token, params = {}) {
  const allData = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      const res = await axios.get(`${GITHUB_API}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json"
        },
        params: { ...params, per_page: perPage, page }
      });

      const data = res.data;
      if (!Array.isArray(data) || data.length === 0) break;

      allData.push(...data);
      if (data.length < perPage) break;

      page++;
    } catch (err) {
      console.error(`❌ Failed fetching ${endpoint}?page=${page}:`, err.message);
      break;
    }
  }

  return allData;
}

// -------------------------
// Main sync function
// -------------------------
exports.syncOrganizationsAndData = async () => {
  const integration = await GithubIntegration.findOne();
  if (!integration) throw new Error("No GitHub integration found");

  const token = integration.accessToken;
  const integrationId = integration._id;

  console.log("🔄 Syncing GitHub data...");

  // 1. Get active orgs via /user/memberships/orgs
  const memberships = await fetchAllFromGitHub("/user/memberships/orgs", token);
  const orgs = memberships
    .filter((m) => m.state === "active")
    .map((m) => ({ login: m.organization.login }));

  if (!orgs.length) {
    throw new Error("No active GitHub organization memberships found for this user.");
  }

  await GithubOrganization.deleteMany({ integrationId });

  // 2. Sync orgs and everything inside
  for (const org of orgs) {
    const orgName = org.login;
    console.log(`🏢 Org: ${orgName}`);

    // Save organization info
    await GithubOrganization.create({
      integrationId,
      login: orgName
    });

    // Sync members
    const members = await fetchAllFromGitHub(`/orgs/${orgName}/members`, token);
    await OrgUser.deleteMany({ integrationId, orgName });
    await OrgUser.insertMany(
      members.map((m) => ({
        integrationId,
        orgName,
        login: m.login,
        avatarUrl: m.avatar_url,
        htmlUrl: m.html_url
      }))
    );

    // Sync repos
    const repos = await fetchAllFromGitHub(`/orgs/${orgName}/repos`, token);
    await OrgRepo.deleteMany({ integrationId, orgName });
    await OrgRepo.insertMany(
      repos.map((repo) => ({
        integrationId,
        orgName,
        repoId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        description: repo.description,
        language: repo.language,
        defaultBranch: repo.default_branch,
        htmlUrl: repo.html_url
      }))
    );

    for (const repo of repos) {
      const repoName = repo.name;
      console.log(`📁 Repo: ${repoName}`);

      // Commits
      const commits = await fetchAllFromGitHub(`/repos/${orgName}/${repoName}/commits`, token);
      await OrgCommit.deleteMany({ integrationId, orgName, repoName });
      await OrgCommit.insertMany(
        commits.map((c) => ({
          integrationId,
          orgName,
          repoName,
          sha: c.sha,
          author: c.commit.author,
          committer: c.commit.committer,
          message: c.commit.message,
          url: c.html_url,
          date: c.commit.author?.date || null
        }))
      );

      // Pull Requests
      const pulls = await fetchAllFromGitHub(`/repos/${orgName}/${repoName}/pulls`, token, { state: "all" });
      await OrgPull.deleteMany({ integrationId, orgName, repoName });
      await OrgPull.insertMany(
        pulls.map((p) => ({
          integrationId,
          orgName,
          repoName,
          number: p.number,
          title: p.title,
          user: p.user,
          state: p.state,
          merged: !!p.merged_at,
          htmlUrl: p.html_url,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }))
      );

      // Issues
      const issues = await fetchAllFromGitHub(`/repos/${orgName}/${repoName}/issues`, token, { state: "all" });
      await OrgIssue.deleteMany({ integrationId, orgName, repoName });
      await OrgIssue.insertMany(
        issues.map((i) => ({
          integrationId,
          orgName,
          repoName,
          number: i.number,
          title: i.title,
          user: i.user,
          state: i.state,
          labels: i.labels,
          htmlUrl: i.html_url,
          createdAt: i.created_at,
          updatedAt: i.updated_at
        }))
      );

      // Changelogs from issue comments
      for (const issue of issues) {
        const comments = await fetchAllFromGitHub(`/repos/${orgName}/${repoName}/issues/${issue.number}/comments`, token);
        await OrgChangelog.deleteMany({ integrationId, orgName, repoName, issueNumber: issue.number });
        await OrgChangelog.insertMany(
          comments.map((c) => ({
            integrationId,
            orgName,
            repoName,
            issueNumber: issue.number,
            body: c.body,
            user: c.user,
            createdAt: c.created_at
          }))
        );
      }
    }
  }

  console.log("✅ GitHub data sync completed.");
};

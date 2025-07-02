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

async function fetchFromGitHub(endpoint, token, params = {}) {
  const res = await axios.get(`${GITHUB_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json"
    },
    params
  });
  return res.data;
}

exports.syncOrganizationsAndData = async () => {
  const integration = await GithubIntegration.findOne();
  if (!integration) throw new Error("No GitHub integration found");

  const token = integration.accessToken;
  const integrationId = integration._id;

  const orgs = await fetchFromGitHub("/user/orgs", token);
  await GithubOrganization.deleteMany({ integrationId });

  await GithubOrganization.insertMany(
    orgs.map((org) => ({
      integrationId,
      orgId: org.id,
      login: org.login,
      avatarUrl: org.avatar_url,
      description: org.description,
      url: org.url
    }))
  );

  for (const org of orgs) {
    const orgName = org.login;

    // Repos
    const repos = await fetchFromGitHub(`/orgs/${orgName}/repos`, token, { per_page: 50 });
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

      // Commits
      const commits = await fetchFromGitHub(`/repos/${orgName}/${repoName}/commits`, token, { per_page: 20 });
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

      // Pulls
      const pulls = await fetchFromGitHub(`/repos/${orgName}/${repoName}/pulls`, token, { state: "all", per_page: 20 });
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
      const issues = await fetchFromGitHub(`/repos/${orgName}/${repoName}/issues`, token, { state: "all", per_page: 20 });
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

      // Changelogs
      for (const issue of issues) {
        const comments = await fetchFromGitHub(`/repos/${orgName}/${repoName}/issues/${issue.number}/comments`, token);
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

    // Members
    const members = await fetchFromGitHub(`/orgs/${orgName}/members`, token, { per_page: 50 });
    await OrgUser.deleteMany({ integrationId, orgName });
    await OrgUser.insertMany(
      members.map((m) => ({
        integrationId,
        orgName,
        login: m.login,
        userId: m.id,
        avatarUrl: m.avatar_url,
        htmlUrl: m.html_url,
        role: m.role || "member"
      }))
    );
  }
};

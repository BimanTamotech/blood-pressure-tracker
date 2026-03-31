const GITHUB_API = "https://api.github.com";

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const csvPath = process.env.GITHUB_CSV_PATH || "data/readings.csv";

  if (!token || !repo) {
    throw new Error("GITHUB_TOKEN and GITHUB_REPO env vars are required");
  }

  return { token, repo, csvPath };
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
}

/**
 * Fetches the CSV file content and its SHA from the GitHub repository.
 *
 * @returns {Promise<{content: string, sha: string}>} The decoded file content and its SHA.
 * @throws {Error} If the file doesn't exist (404) or the request fails.
 */
export async function fetchCSVFromGitHub() {
  const { token, repo, csvPath } = getConfig();
  const url = `${GITHUB_API}/repos/${repo}/contents/${csvPath}`;

  const res = await fetch(url, { headers: headers(token) });

  if (res.status === 404) {
    return { content: "", sha: null };
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

/**
 * Writes (creates or updates) the CSV file in the GitHub repository.
 *
 * @param {string} content - The full CSV content to write.
 * @param {string|null} sha - The SHA of the existing file (null for new files).
 * @param {string} message - The commit message.
 * @returns {Promise<object>} The GitHub API response.
 */
export async function writeCSVToGitHub(content, sha, message = "Update BP readings") {
  const { token, repo, csvPath } = getConfig();
  const url = `${GITHUB_API}/repos/${repo}/contents/${csvPath}`;

  const body = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
  };

  if (sha) {
    body.sha = sha;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${errText}`);
  }

  return res.json();
}

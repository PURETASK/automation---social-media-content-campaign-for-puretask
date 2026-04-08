import { base44 } from '@base44/core';

// Auto-commit any new/updated assets to GitHub
export default async function autoCommitAssets(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { files, commit_message, folder = 'assets' } = body;

  const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
  const REPO = 'PURETASK/automation---social-media-content-campaign-for-puretask';
  const BASE_URL = `https://api.github.com/repos/${REPO}/contents`;

  if (!GITHUB_TOKEN) {
    return new Response(JSON.stringify({ error: 'GITHUB_TOKEN not set' }), { status: 500 });
  }

  if (!files || !Array.isArray(files)) {
    return new Response(JSON.stringify({ error: 'files array required' }), { status: 400 });
  }

  const results = [];

  for (const file of files) {
    const { path, content, message } = file;
    const fullPath = `${folder}/${path}`;
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    // Check if file exists to get SHA
    let sha = null;
    try {
      const checkRes = await fetch(`${BASE_URL}/${fullPath}`, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json'
        }
      });
      if (checkRes.ok) {
        const existing = await checkRes.json();
        sha = existing.sha;
      }
    } catch (_) {}

    const payload: Record<string, string> = {
      message: message || commit_message || `Auto-commit: ${path}`,
      content: encodedContent
    };
    if (sha) payload.sha = sha;

    const res = await fetch(`${BASE_URL}/${fullPath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    results.push({
      path: fullPath,
      success: res.ok,
      url: data?.content?.html_url || null,
      error: !res.ok ? data?.message : null
    });
  }

  return new Response(JSON.stringify({ committed: results.length, results }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

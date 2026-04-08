import { base44 } from '@base44/core';

// Push all entity JSON schemas to GitHub engine/entities/ folder
export default async function syncEntitySchemas(req: Request) {
  const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
  const REPO = 'PURETASK/automation---social-media-content-campaign-for-puretask';
  const BASE_URL = `https://api.github.com/repos/${REPO}/contents`;

  if (!GITHUB_TOKEN) {
    return new Response(JSON.stringify({ error: 'GITHUB_TOKEN not set' }), { status: 500 });
  }

  // Get all entity schemas from the app
  const entities = await base44.asServiceRole.entities._meta?.list?.() || [];

  const results = [];
  const entityNames = ['ContentDraft', 'ContentIdea', 'MarketResearch', 'PostPerformance', 'WinnerDNA'];

  for (const name of entityNames) {
    try {
      // Fetch current schema
      const schemaRes = await fetch(`${Deno.env.get('BASE44_API_URL')}/entities/${name}/schema`, {
        headers: { 'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_TOKEN')}` }
      });

      let schemaContent = `{ "name": "${name}", "note": "Schema auto-synced from Base44" }`;
      if (schemaRes.ok) {
        const schema = await schemaRes.json();
        schemaContent = JSON.stringify(schema, null, 2);
      }

      const path = `engine/entities/${name}.json`;
      const encodedContent = btoa(unescape(encodeURIComponent(schemaContent)));

      // Check for existing SHA
      let sha = null;
      const checkRes = await fetch(`${BASE_URL}/${path}`, {
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }
      });
      if (checkRes.ok) {
        sha = (await checkRes.json()).sha;
      }

      const payload: Record<string, string> = {
        message: `Auto-sync: update ${name} schema`,
        content: encodedContent
      };
      if (sha) payload.sha = sha;

      const pushRes = await fetch(`${BASE_URL}/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const pushData = await pushRes.json();
      results.push({
        entity: name,
        success: pushRes.ok,
        url: pushData?.content?.html_url || null
      });
    } catch (e) {
      results.push({ entity: name, success: false, error: String(e) });
    }
  }

  return new Response(JSON.stringify({ synced: results.filter(r => r.success).length, results }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

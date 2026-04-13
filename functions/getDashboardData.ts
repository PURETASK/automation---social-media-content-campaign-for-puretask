// PureTask Dashboard Data Proxy
// Fetches all entities with service-role access and returns them to the frontend
// This bypasses RLS restrictions that block unauthenticated mini-app requests

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const body = await req.json().catch(() => ({}));
    const { entities = ["ContentDraft", "PostPerformance", "ContentIdea", "WinnerDNA", "MarketResearch"] } = body;

    const result: Record<string, any[]> = {};

    await Promise.all(
      entities.map(async (entityName: string) => {
        try {
          const records = await db[entityName].list();
          result[entityName] = Array.isArray(records) ? records : [];
        } catch (e: any) {
          console.error(`Failed to fetch ${entityName}:`, e.message);
          result[entityName] = [];
        }
      })
    );

    return new Response(JSON.stringify({ ok: true, data: result }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});

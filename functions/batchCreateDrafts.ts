
import { base44 } from "@base44/core";

export default async function batchCreateDrafts(req: Request) {
  const body = await req.json();
  const records = body.records || [];
  
  try {
    // Use service role to bypass auth checks
    const created = await base44.asServiceRole.entities.ContentDraft.create(records);
    return new Response(JSON.stringify({
      success: true,
      count: created.length,
      ids: created.map((r: any) => r.id),
      records: created
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.toString()
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

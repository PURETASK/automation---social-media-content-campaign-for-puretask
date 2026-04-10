import { base44 } from "@base44/core";

export default async function createDailyDrops(req: Request) {
  const body = await req.json();
  const records = body.records || [];
  
  try {
    // Create all records
    const created = [];
    for (const record of records) {
      const newDraft = await base44.asServiceRole.entities.ContentDraft.create([record]);
      created.push(...newDraft);
    }
    
    return new Response(JSON.stringify({
      success: true,
      count: created.length,
      ids: created.map((r: any) => r.id),
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.toString()
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

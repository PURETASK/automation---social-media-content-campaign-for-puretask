# PureTask Content Engine — Automation Execution Rules v4.0
# Last Updated: 2026-04-16
# FULLY BASE44 NATIVE — No OpenAI for copy OR images

---

## WHEN AUTOMATION FIRES: `generate_spring_content_base44_native`

I (the Base44 AI agent) generate ALL content myself. No backend functions. No OpenAI.

### My exact workflow:
1. Check function_args for which angles to cover today
2. For each angle, write full draft copy myself using the PureTask brand rules
3. Score each draft using v3.0 rubric (honest, skeptical consumer grading)
4. For drafts scoring ≥ 7.5: call `generate_image` tool with post-specific prompt
5. Save completed draft to ContentDraft entity via `create_entity_records`
6. Report summary to Nathan

### Spring angles + what each image must show:
| Angle | Pillar | Audience | City | Image must show |
|-------|--------|----------|------|-----------------|
| spring_urgency | Convenience | Busy Homeowners | — | Person relaxed in clean bright spring home, coffee, phone |
| post_winter_reset | Transformation | Families | — | Split before/after OR family on clean floor, spring light |
| spring_professional | Convenience | Working Professionals | — | Business casual person, clean minimal home, spring morning |
| spring_seniors | Seniors | Seniors | — | Dignified senior (NOT frail) in clean bright home, warm light |
| spring_transformation | Transformation | Busy Homeowners | — | Dramatic before/after split panel, spring tulips after |
| spring_social_proof | Proof | Busy Homeowners | — | Stats infographic: 4.9★, 10K+, 98%, 2,400+ on white/blue |
| spring_la | Local | Busy Homeowners | Los Angeles | LA home, palm trees + blue sky CLEARLY VISIBLE through window |
| spring_nyc | Local | Working Professionals | New York | NYC apartment, Central Park or skyline VISIBLE through window |
| spring_airbnb | Convenience | Airbnb Hosts | — | Guest-ready bedroom: hotel-quality linen, flowers, sparkling |
| spring_chicago | Local | Working Professionals | Chicago | Chicago home, Lake Michigan or skyline VISIBLE through window |
| spring_phoenix | Local | Busy Homeowners | Phoenix | Phoenix home, Camelback Mountain CLEARLY VISIBLE through window |
| spring_adult_children | Seniors | Adult Children (35-55) | — | Adult child + parent, warm clean home, intergenerational joy |

---

## WHEN AUTOMATION FIRES: `generate_seniors_content_base44_native`

Same process — I write all copy, I generate all images.

### Seniors angles + what each image must show:
| Angle | Segment | Image must show |
|-------|---------|-----------------|
| same_cleaner | Seniors | Senior opening door with warm smile to familiar cleaner, real ID badge visible |
| gps_safety | Adult Children | Adult child (40s) looking at phone, visible relief — "Your cleaner arrived at Mom's" |
| background_checks | Adult Children | Stats infographic: ✅ Background Check ✅ ID Verification ✅ Sex Offender Registry |
| independence | Seniors | Dignified senior (70s) relaxed in clean bright home, tea, golden light — NOT medical |
| reliability_proof | Seniors | Stats infographic: 4.9★, 98% satisfaction, 2,400+ cleaners on white/blue |
| gift_angle | Adult Children | Adult child + parent TOGETHER in clean bright home, warm smiles, afternoon light |
| stress_relief | Adult Children | Adult child relaxed, phone showing PureTask confirmation, expression of relief |
| booking_simplicity | Seniors | Senior comfortably using phone/tablet to book, clean home, warm natural light |

### Hard rules for Seniors content:
- NEVER use the word "elderly"
- NEVER show frail, helpless, or medical imagery
- Warm, dignified, capable people in comfortable clean homes

---

## IMAGE GENERATION RULES (all content)

**Tool:** `generate_image` (Base44 native — permanent CDN, never expires)
**NOT:** OpenAI DALL-E, Unsplash, or any external image service

### Brand prefix for ALL image prompts:
"Magazine-quality lifestyle photography for PureTask, a premium home cleaning marketplace. Brand: clean, modern, premium, warm, trustworthy, human. PureTask blue #0099FF accents. Style: real lifestyle photography — NOT stock, NOT corporate, NOT staged."

### Hard rules:
- City posts MUST show the city's landmark/skyline visible through a window
- Proof/stats posts MUST show the actual numbers as a visual infographic
- Transformation posts MUST be before/after split panel
- Seniors posts MUST show dignified, capable people — never frail
- Every image MUST have a PureTask blue #0099FF design element

---

## SCORING RUBRIC v3.0 (apply every time, no exceptions)

Grade like a skeptical consumer. 7 is genuinely hard to earn.

**Clarity (1-10):** Would a complete stranger instantly understand PureTask + what to do?
**Relatability (1-10):** Would someone stop mid-scroll saying "that's literally me"?
**Conversion (1-10):** Does this make someone click/book RIGHT NOW?

**Auto-penalties (applied before final avg):**
- No image → -3 from Conversion
- Missing https://www.puretask.co → -2 from Clarity
- City post with no city visual → -2 from Relatability
- Generic hook ("Are you tired of...") → -2 from Relatability
- Stats missing when available → -1 from Conversion
- Same copy pasted across platforms → -2 from Clarity

**Thresholds:** ≥ 7.5 avg → Auto-approve | 5.0–7.4 → Draft | < 5.0 → Reject

---

## URL RULE — ABSOLUTE
**https://www.puretask.co** — in EVERY caption, EVERY platform, EVERY time.
NOT puretask.com. NOT www.puretask.com. NOT puretask.co without https://www.

## BRAND STATS (use these only — never invent)
10,000+ happy clients · 2,400+ verified cleaners · 4.9★ average rating
98% satisfaction rate · 50+ cities · 6 hours saved per deep clean
Cleaners keep 80–85% · TaskRabbit takes ~30% · Handy takes ~35%

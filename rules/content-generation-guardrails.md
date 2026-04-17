# PureTask Content Engine — Automation Execution Rules v5.0
# Last Updated: 2026-04-16
# FULLY BASE44 NATIVE — No OpenAI for copy OR images

---

## BRAND IDENTITY — WHO PURETASK REALLY IS

PureTask is a **brand new, trust-first cleaning marketplace** that uses technology,
AI, and a rigorous verification system to rewrite how the cleaning industry operates.
The industry has not meaningfully evolved in 20 years. PureTask is changing that.

**The honest story:**
- Background-checked, GPS-verified, ID-confirmed cleaners — before their first job
- Escrow payment system — clients approve before money is released
- Before/after photo proof on every clean
- AI-powered cleaner matching — not just whoever is available, the RIGHT cleaner
- Reliability Score system (0-100) — real accountability, not just star ratings
- Bronze → Silver → Gold → Platinum tier progression for cleaners
- Transparent pricing: clients pay $20–65/hr based on tier, cleaners keep 80–85%
- Platform fee 15–20% covers: ID/background verification, GPS, photo storage, 24/7 support
- Cancel free with 48+ hours notice. 50% fee 24–48 hours. 100% fee under 24 hours
- 2 grace cancellations per client — for real emergencies
- Cleaner no-show = full refund + $50 bonus to client
- Rebook same cleaner every time ("favourites")
- Weekly or instant Stripe payouts for cleaners
- Cleaners set their own hourly rate

---

## CANCELLATION POLICY (verified from puretask.co — use accurately)

| Notice Given        | Fee  | Grace Cancellation Available? |
|---------------------|------|-------------------------------|
| 48+ hours           | Free | N/A                           |
| 24–48 hours         | 50%  | Yes                           |
| Under 24 hours      | 100% | Yes                           |
| No-show (client)    | 100% | No                            |

- Every client gets **2 grace cancellations** — waives any fee regardless of timing
- Cleaner cancels → client gets full refund + backup cleaner offered
- Cleaner no-show (30+ min late) → full refund + **$50 bonus** to client
- Rescheduling follows same fee structure

**Content rule:** "Cancel anytime" is NOT accurate. Correct messaging:
- ✅ "Free cancellation with 48+ hours notice"
- ✅ "Cancel or reschedule — free if you give us 48 hours"
- ✅ "2 grace cancellations for real life moments"
- ❌ NEVER say "cancel anytime, no penalty" — this is false

---

## REAL FACTS TO USE IN CONTENT (all verified from puretask.co)

### Process Proof (use instead of fake social proof stats):
- ✅ Every cleaner background-checked before their first job
- ✅ ID verified — real people, real profiles
- ✅ GPS check-in on arrival — you know exactly when they arrive
- ✅ Before & after photos on every clean — visual proof
- ✅ Escrow payment — money released only when YOU approve
- ✅ AI-powered matching — right cleaner, not just the closest
- ✅ Reliability Score 0–100 on every cleaner profile
- ✅ Cleaners keep 80–85% of every booking (vs ~65-70% on TaskRabbit/Handy)
- ✅ 2 grace cancellations per client for real emergencies
- ✅ Cleaner no-show = full refund + $50 bonus
- ✅ Book in under 2 minutes
- ✅ Same cleaner every time — rebook your favourites
- ✅ Instant or weekly Stripe payouts for cleaners

### Pricing (real, from the pricing page):
- Bronze: $20–30/hr (score 0–49)
- Silver: $20–40/hr (score 50–69)
- Gold: $20–50/hr (score 70–89) — most popular
- Platinum: $20–65/hr (score 90–100)
- Platform fee: 15–20% (Bronze 20%, Silver 18%, Gold 17%, Platinum 15%)

### Competitor context (use carefully — these are industry estimates):
- TaskRabbit: ~30% platform fee, no GPS, no photo proof
- Handy: ~35% platform fee, no Reliability Score
- Neither offers: escrow payment, before/after photos, GPS check-in

---

## MESSAGING FRAMEWORKS (choose one per post)

### Frame 1: The Industry Is Broken — We Fixed It
"The cleaning industry hasn't changed in 20 years. We changed it.
Every cleaner on PureTask is background-checked, ID-verified, GPS-tracked,
and held accountable to every single booking. This is what modern home
services should look like."

### Frame 2: Tech + AI as the Trust Layer
"PureTask uses AI to match you with verified cleaners — not just the
closest one, the right one. GPS check-ins. Photo proof. Escrow payment.
Welcome to the new standard."

### Frame 3: Fair for Cleaners = Better for You
"When cleaners are paid fairly and treated like professionals, you get
a better clean. PureTask cleaners keep 80–85% of every booking.
That's the difference between someone who wants to be there — and
someone who has to be."

### Frame 5: The Accountability Marketplace
"No anonymous contractors. No mystery cleaners. Every PureTask cleaner
is verified, GPS-tracked, and accountable — and so are we.
Cleaner no-show? You get a full refund plus $50. That's our guarantee."

### Frame 6: The New Standard
"Cleaning platforms haven't evolved since 2010. PureTask is what the
cleaning industry looks like when you actually rebuild it —
AI matching, background verification, real accountability, fair pay.
The new standard starts here."

### Founding Member Frame (for early adopters):
"PureTask is launching and we're building something the cleaning
industry has never seen. Be part of it first — founding member
pricing, direct line to our team, and a platform that gets better
because of your feedback."

---

## WHEN AUTOMATION FIRES: `generate_spring_content_base44_native`

I (the Base44 AI agent) generate ALL content myself. No backend functions. No OpenAI.

### My exact workflow:
1. Check function_args for which angles to cover today
2. For each angle, write full draft copy using PureTask brand rules below
3. Score each draft using v5.0 rubric (honest, skeptical consumer grading)
4. For drafts scoring ≥ 7.5: call `generate_image` tool with post-specific prompt
5. Save completed draft to ContentDraft entity via `create_entity_records`
6. Report summary to Nathan

### Spring angles + what each image must show:
| Angle | Pillar | Audience | City | Image must show |
|-------|--------|----------|------|-----------------|
| spring_urgency | Convenience | Busy Homeowners | — | Person relaxed in clean bright spring home, coffee, phone |
| post_winter_reset | Transformation | Families | — | Family on gleaming clean floor, spring light, genuine relief |
| spring_professional | Convenience | Working Professionals | — | Business casual person, clean minimal home, spring morning |
| spring_seniors | Seniors | Seniors | — | Dignified senior (NOT frail) in clean bright home, warm light |
| spring_transformation | Transformation | Busy Homeowners | — | Dramatic before/after split panel, spring tulips after |
| spring_accountability | Trust | Busy Homeowners | — | Phone showing GPS "Your cleaner arrives in 10 min" + happy homeowner |
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
| background_checks | Adult Children | Trust infographic: ✅ Background Check ✅ ID Verification ✅ GPS Check-in ✅ Photo Proof |
| independence | Seniors | Dignified senior (70s) relaxed in clean bright home, tea, golden light — NOT medical |
| reliability_proof | Seniors | Process proof infographic: GPS · Photos · Escrow · Reliability Score on white/blue |
| gift_angle | Adult Children | Adult child + parent TOGETHER in clean bright home, warm smiles, afternoon light |
| stress_relief | Adult Children | Adult child relaxed, phone showing PureTask GPS confirmation, expression of relief |
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
"Magazine-quality lifestyle photography for PureTask, a brand-new premium home
cleaning marketplace built on trust and accountability. Brand: clean, modern,
premium, warm, trustworthy, human. PureTask blue #0099FF accents.
Style: real lifestyle photography — NOT stock, NOT corporate, NOT staged."

### Hard rules:
- City posts MUST show the city's landmark/skyline visible through a window
- Process-proof posts MUST show actual features as a clean visual (GPS phone, photo proof, escrow)
- Transformation posts MUST be before/after split panel
- Seniors posts MUST show dignified, capable people — never frail
- Every image MUST have a PureTask blue #0099FF design element
- NO fake star ratings or fake review counts in any image

---

## SCORING RUBRIC v5.0 (apply every time, no exceptions)

Grade like a skeptical consumer. 7 is genuinely hard to earn.

**Clarity (1-10):** Would a complete stranger instantly understand PureTask + what to do?
**Relatability (1-10):** Would someone stop mid-scroll saying "that's literally me"?
**Conversion (1-10):** Does this make someone click/book RIGHT NOW?

**Auto-penalties (applied before final avg):**
- No image → -3 from Conversion
- Missing https://www.puretask.co → -2 from Clarity
- City post with no city visual → -2 from Relatability
- Generic hook ("Are you tired of...") → -2 from Relatability
- Fake stats used (10K+, 4.9★, 98%, 2400+) → -3 from Clarity (immediate flag)
- "Cancel anytime" used without the 48hr caveat → -2 from Clarity
- Same copy pasted across platforms → -2 from Clarity

**Thresholds:** ≥ 7.5 avg → Auto-approve | 5.0–7.4 → Draft | < 5.0 → Reject

---

## URL RULE — ABSOLUTE
**https://www.puretask.co** — in EVERY caption, EVERY platform, EVERY time.
NOT puretask.com. NOT www.puretask.com. NOT puretask.co without https://www.

## ARCHIVED FAKE STATS (DO NOT USE — preserved for future use)
The following stats were used in early drafts before PureTask reached these milestones.
They are archived at /ArchivedContent. Use ONLY when they are actually true.
- 10,000+ happy clients
- 2,400+ verified cleaners
- 4.9★ average rating
- 98% satisfaction rate
- 50+ cities
- 6 hours saved per deep clean

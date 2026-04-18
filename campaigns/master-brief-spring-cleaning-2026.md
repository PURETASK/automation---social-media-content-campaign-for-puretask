# PureTask — Spring Cleaning Campaign 2026
# MASTER BRIEF — AUTOMATION GUIDE
# Version: 1.0 | Created: April 17, 2026
# Used by: spring_cleaning_generator automation
# Campaign: April 18 – June 16, 2026 (60 days)
# Volume: 2 posts per day = 120 posts total
# Images per post: 3 (Unique hero + Image A square + Image B landscape)
# Platforms: Facebook, Instagram, X, LinkedIn, Pinterest, Threads, TikTok/YouTube

---

## CAMPAIGN IDENTITY

**Campaign Tag:** SpringCleaning-2026
**Campaign Goal:** Drive first bookings from homeowners across NorCal during peak spring cleaning season
**Primary CTA:** Book your first clean → https://www.puretask.co
**Tone:** Warm, real, sometimes funny, always honest. Never corporate. Never fake.
**Brand color:** PureTask blue #0099FF in every image

---

## DAILY POST STRUCTURE

Every day has 2 posts:
- **Session 1 (AM post):** Emotional / Humorous / Storytelling / Relatable
- **Session 2 (PM post):** Data / Educational / Conversion / Trust

The automation checks `day_number` and `session_number` in ContentDraft to determine what to generate next.

Logic:
- Count existing SpringCleaning-2026 drafts
- Next day_number = (total existing drafts / 2) + 1 — rounded down
- If day_number posts exist for today but only 1 session, generate session 2
- If both sessions exist for today, move to next day

---

## 60-DAY SCHEDULE — POST TYPE ASSIGNMENT

### WEEK 1 (Days 1-7): THE GUILT / THE PROBLEM
Theme: Spring is here. Your home isn't ready. You know it. We know it.
Emotional target: Recognition, relatability, gentle shame → relief

| Day | Session | Post Type | Post Type Detail |
|-----|---------|-----------|-----------------|
| 1 | AM | Humor/Relatable | The cleaning pile that started as one sock |
| 1 | PM | Urgency/FOMO | Spring cleaning season is here — are you ready? |
| 2 | AM | Humor/Relatable | The 5 stages of spring cleaning guilt |
| 2 | PM | List/Carousel | 5 signs you need a deep clean |
| 3 | AM | Humor/Relatable | You vs the thing you said you'd clean in January |
| 3 | PM | Authority/Education | Deep clean vs regular clean — what's the difference |
| 4 | AM | Humor/Relatable | Things we all pretend we'll clean before guests arrive |
| 4 | PM | Authority/Education | Room-by-room spring cleaning checklist |
| 5 | AM | Storytelling/Emotional | A day in the life — follow a homeowner on their worst cleaning day |
| 5 | PM | List/Carousel | The spring cleaning checklist nobody finishes |
| 6 | AM | Humor/Relatable | Types of homeowners — which one are you? |
| 6 | PM | Comparison/Contrast | DIY clean vs professional clean |
| 7 | AM | Humor/Relatable | Relatable pain point humor — the junk drawer |
| 7 | PM | Urgency/FOMO | Your neighbor already booked their spring clean |

### WEEK 2 (Days 8-14): THE SOLUTION
Theme: There's a better way. Here's exactly what it looks like.
Emotional target: Curiosity → understanding → trust

| Day | Session | Post Type | Post Type Detail |
|-----|---------|-----------|-----------------|
| 8 | AM | Storytelling/Emotional | Before & After story — transformation narrative |
| 8 | PM | Authority/Education | How GPS check-in works — explainer |
| 9 | AM | Storytelling/Emotional | She almost didn't book — overcoming hesitation story |
| 9 | PM | Authority/Education | What escrow payment means in plain English |
| 10 | AM | Video/Script | 30-second explainer — what PureTask does |
| 10 | PM | Authority/Education | How to pick a cleaning service — guide |
| 11 | AM | Storytelling/Emotional | Founding story — why PureTask was built |
| 11 | PM | Authority/Education | Background check process walkthrough |
| 12 | AM | Video/Script | POV: you just booked PureTask format |
| 12 | PM | Authority/Education | Reliability Score explained |
| 13 | AM | Storytelling/Emotional | A day in the life — follow a cleaner (professional pride angle) |
| 13 | PM | Comparison/Contrast | Old way vs PureTask way |
| 14 | AM | Video/Script | Before/after timelapse concept — spring clean |
| 14 | PM | Comparison/Contrast | Star rating vs Reliability Score |

### WEEK 3 (Days 15-21): SOCIAL PROOF / FOMO
Theme: Real people are doing this. The community is forming. Are you in it?
Emotional target: Social proof → FOMO → desire

| Day | Session | Post Type | Post Type Detail |
|-----|---------|-----------|-----------------|
| 15 | AM | Social Proof/Trust | GPS arrival screenshot style — the notification that changes everything |
| 15 | PM | Urgency/FOMO | Limited spots in your area |
| 16 | AM | Social Proof/Trust | Before & after photo proof — kitchen transformation |
| 16 | PM | Polling/Interactive | Which room do you dread cleaning most? |
| 17 | AM | Social Proof/Trust | Escrow approved screen — you don't pay until you approve |
| 17 | PM | Polling/Interactive | What's your spring cleaning personality? |
| 18 | AM | Social Proof/Trust | Reliability Score showcase — what 87/100 means |
| 18 | PM | Polling/Interactive | This or that — deep clean now vs wait until summer? |
| 19 | AM | Storytelling/Emotional | The no-show that changed everything |
| 19 | PM | Social Proof/Trust | What 87/100 means — real data post |
| 20 | AM | Storytelling/Emotional | Client testimonial format — family story (no fake quotes) |
| 20 | PM | List/Carousel | 7 things cleaners notice that you don't |
| 21 | AM | Urgency/FOMO | Spring ends in X weeks — seasonal deadline |
| 21 | PM | Polling/Interactive | Would you pay $X for this clean? |

### WEEK 4 (Days 22-28): CONVERSION PUSH
Theme: You've seen enough. Here's how to book. Do it now.
Emotional target: Confidence → action → booking

| Day | Session | Post Type | Post Type Detail |
|-----|---------|-----------|-----------------|
| 22 | AM | Video/Script | 15-second hook reel — spring cleaning is here |
| 22 | PM | Data/Math | ROI of a clean home — time saved × hourly rate |
| 23 | AM | Urgency/FOMO | Founding member window closing |
| 23 | PM | Data/Math | What $150 actually buys you — breakdown |
| 24 | AM | Video/Script | Talking head script — Nathan-style founder message |
| 24 | PM | Comparison/Contrast | Before PureTask / After PureTask split |
| 25 | AM | Storytelling/Emotional | Parent/child story — booking for aging parent |
| 25 | PM | List/Carousel | 10 things to do before your cleaner arrives |
| 26 | AM | Video/Script | Voiceover-over-visuals script — spring transformation |
| 26 | PM | Data/Math | What $X actually buys you — deep clean breakdown |
| 27 | AM | Polling/Interactive | Caption this — spring cleaning chaos image |
| 27 | PM | Comparison/Contrast | TaskRabbit fee vs PureTask fee |
| 28 | AM | Video/Script | 45-second transformation story — spring clean |
| 28 | PM | Urgency/FOMO | Book this week — spring pricing available now |

### WEEK 5 (Days 29-35): DEEP CLEAN SPECIFIC
Theme: Not just "clean" — DEEP clean. What it is, why it matters, why spring.
Emotional target: Education → aspiration → booking upgrade

| Day | Session | Post Type | Post Type Detail |
|-----|---------|-----------|-----------------|
| 29 | AM | Humor/Relatable | Relatable pain point — the baseboards nobody ever cleans |
| 29 | PM | Authority/Education | Deep clean vs regular clean — room by room breakdown |
| 30 | AM | Storytelling/Emotional | Before & After story — bathroom deep clean transformation |
| 30 | PM | List/Carousel | 3 reasons spring is the best time for a deep clean |
| 31 | AM | Video/Script | Day-in-the-life vlog concept — deep clean day |
| 31 | PM | Data/Math | Deep clean ROI — what $200 actually cleans |
| 32 | AM | Humor/Relatable | The fridge clean you've been avoiding since December |
| 32 | PM | Authority/Education | Room-by-room spring cleaning checklist — deep clean edition |
| 33 | AM | Social Proof/Trust | Before & after photo proof — full home deep clean |
| 33 | PM | Comparison/Contrast | Regular clean vs deep clean — price and scope breakdown |
| 34 | AM | Video/Script | Meet your cleaner — profile video script |
| 34 | PM | List/Carousel | 5 signs you need a deep clean (not just a regular) |
| 35 | AM | Polling/Interactive | Which room needs the most help in your home? |
| 35 | PM | Urgency/FOMO | Deep clean spots filling up — book before they're gone |

### WEEK 6 (Days 36-42): MOTHER'S DAY ANGLE
Theme: Gift a clean. The most thoughtful gift that actually helps.
Emotional target: Love, care, practicality, generosity
Key date: Mother's Day — May 11, 2026

| Day | Session | Post Type | Post Type Detail |
|-----|---------|-----------|-----------------|
| 36 | AM | Seasonal/Timely | Mother's Day angle — gift a clean, not another candle |
| 36 | PM | Storytelling/Emotional | Parent/child story — she does so much, give her this |
| 37 | AM | Video/Script | 15-second hook — Mother's Day gift idea |
| 37 | PM | List/Carousel | 5 reasons a clean home is the best Mother's Day gift |
| 38 | AM | Humor/Relatable | Things your mom has been pretending not to notice |
| 38 | PM | Authority/Education | How to gift a PureTask clean — step by step |
| 39 | AM | Storytelling/Emotional | A day in the life — mom's first PureTask clean |
| 39 | PM | Urgency/FOMO | Mother's Day is X days away — book now |
| 40 | AM | Social Proof/Trust | Before & after photo proof — gifted clean |
| 40 | PM | Polling/Interactive | What's the best Mother's Day gift — poll |
| 41 | AM | Video/Script | Voiceover script — she does everything, do this for her |
| 41 | PM | Comparison/Contrast | Flowers vs a clean home — which lasts longer? |
| 42 | AM | Seasonal/Timely | Mother's Day last call — book your gift clean today |
| 42 | PM | Urgency/FOMO | Last chance for Mother's Day delivery |

### WEEK 7 (Days 43-49): MEMORIAL DAY PREP / HOSTING
Theme: Memorial Day weekend. Guests are coming. Is your home ready?
Emotional target: Anticipation → mild panic → relief with PureTask
Key date: Memorial Day — May 25, 2026

| Day | Session | Post Type | Post Type Detail |
|-----|---------|-----------|-----------------|
| 43 | AM | Seasonal/Timely | Memorial Day weekend hosting prep — guests are coming |
| 43 | PM | List/Carousel | 10 things to clean before Memorial Day guests arrive |
| 44 | AM | Humor/Relatable | The panic clean you do when guests are 30 minutes away |
| 44 | PM | Authority/Education | How to prep your home for a long weekend of guests |
| 45 | AM | Video/Script | POV: Memorial Day weekend starts in 3 days — your home isn't ready |
| 45 | PM | Data/Math | What a pre-holiday clean costs vs the stress of DIY |
| 46 | AM | Storytelling/Emotional | Before & After — home goes from chaos to guest-ready |
| 46 | PM | Urgency/FOMO | Memorial Day weekend spots — limited availability |
| 47 | AM | Social Proof/Trust | GPS + photo proof — clean confirmed before guests arrive |
| 47 | PM | Comparison/Contrast | DIY panic clean vs PureTask before Memorial Day |
| 48 | AM | Humor/Relatable | Things you hide in closets when guests are coming |
| 48 | PM | List/Carousel | 5 rooms to prioritize before holiday hosting |
| 49 | AM | Seasonal/Timely | Memorial Day is 3 days away — book today, host confidently |
| 49 | PM | Urgency/FOMO | Last Memorial Day spots — book now |

### WEEK 8 (Days 50-60): LAST CHANCE SPRING / SUMMER PREVIEW
Theme: Spring is almost over. Summer is coming. Don't miss the window.
Emotional target: Mild regret for waiting → final urgency → conversion

| Day | Session | Post Type | Post Type Detail |
|-----|---------|-----------|-----------------|
| 50 | AM | Urgency/FOMO | Spring ends in 2 weeks — have you done your spring clean? |
| 50 | PM | Data/Math | The cost of NOT doing a spring clean — accumulated mess |
| 51 | AM | Storytelling/Emotional | She waited until June — what she wished she'd done in April |
| 51 | PM | Comparison/Contrast | Spring clean vs summer clean — why spring wins |
| 52 | AM | Humor/Relatable | It's almost summer and your home still looks like February |
| 52 | PM | List/Carousel | 3 reasons to book before spring officially ends |
| 53 | AM | Video/Script | 30-second explainer — summer starts with a clean home |
| 53 | PM | Social Proof/Trust | Before & after — last spring clean of the season |
| 54 | AM | Seasonal/Timely | New season, new standard — summer edition preview |
| 54 | PM | Polling/Interactive | Did you do your spring clean this year? |
| 55 | AM | Urgency/FOMO | Final spring cleaning week — book before June |
| 55 | PM | Data/Math | ROI of starting summer with a clean home |
| 56 | AM | Storytelling/Emotional | Founding story — why this spring mattered |
| 56 | PM | Authority/Education | How to maintain a clean home through summer |
| 57 | AM | Video/Script | 45-second transformation — spring to summer |
| 57 | PM | Comparison/Contrast | Before PureTask / After PureTask — spring edition |
| 58 | AM | Humor/Relatable | Types of homeowners at the end of spring |
| 58 | PM | Social Proof/Trust | The spring clean that changed how she thinks about her home |
| 59 | AM | Seasonal/Timely | Spring 2026 — what did we build together? |
| 59 | PM | Urgency/FOMO | Spring officially ends June 20 — last call |
| 60 | AM | Storytelling/Emotional | Client testimonial format — spring 2026 recap |
| 60 | PM | Seasonal/Timely | Summer is here. The standard doesn't change. |

---

## IMAGE GENERATION RULES

Every post gets 3 images. Generate all 3 in the same automation run.

### Image 1 — Unique Hero
Highly specific to this exact post concept. Use the post type and detail to craft a tailored prompt.

**Base prefix for ALL images:**
"Magazine-quality lifestyle photography for PureTask, a brand-new premium home cleaning marketplace. Brand: clean, modern, premium, warm, trustworthy, human. PureTask blue #0099FF accents. Style: real lifestyle photography — NOT stock, NOT corporate, NOT staged."

**Post-type visual guidelines:**
- Humor posts: Real, relatable domestic chaos. Sock pile, junk drawer, dusty baseboard. Honest, funny, warm.
- Before/After: Always split panel. LEFT = real (not extreme) mess. RIGHT = gleaming clean. Spring light on right side.
- Video scripts: Phone/camera framing. Behind-the-scenes energy. Natural light.
- Educational: Clean infographic on white background. PureTask blue #0099FF dominant.
- FOMO/Urgency: Warm California light, neighbors in background, phone showing notification.
- Seasonal: Spring flowers, open windows, green trees, golden California light.
- Mother's Day: Warm intergenerational — adult child + parent. NOT sad. Joyful.
- Memorial Day: American flag subtle, backyard prep, bright summer light.
- Polling: Bold question graphic. Clean white background. Blue poll bubbles.

### Image A — Square/Portrait (1:1)
Same concept as Image 1 but:
- Tighter crop, more vertical
- Bold, graphic-forward
- Works as Instagram feed post
- More text space at top or bottom
- Warm but high contrast

Prompt suffix to add: "Square format 1:1. Bold graphic composition. Instagram-optimized. Strong foreground subject, clean negative space."

### Image B — Landscape (16:9)
Same concept as Image 1 but:
- Wider frame, more environmental
- LinkedIn/Pinterest/YouTube thumbnail energy
- More negative space on sides for text overlay
- Professional, aspirational feel

Prompt suffix to add: "Landscape format 16:9. Wide environmental shot. LinkedIn and YouTube thumbnail optimized. Aspirational, room to breathe."

---

## PLATFORM-SPECIFIC WRITING RULES

### Facebook
- 150-300 words
- Storytelling or list format
- Emojis: moderate (3-5 max)
- Hashtags: none or minimal (1-2)
- Ends with a question OR a direct CTA
- Link: https://www.puretask.co at the end

### Instagram
- 50-150 words caption
- First line is the HOOK (no fluff)
- Line breaks between short paragraphs
- 8-12 relevant hashtags at the end
- Always include: #PureTask #SpringCleaning #HomeClean
- Link: "Link in bio → puretask.co"

### X / Twitter
- Max 280 characters
- Hook first, no preamble
- Link at the very end
- No hashtags unless space allows (max 2)

### LinkedIn
- 100-200 words
- Professional but human tone
- Insight-led opening
- Business/professional angle on the same story
- Hashtags: 3-5 professional ones

### Pinterest
- SEO-optimized title (60 chars max)
- Description: 150-300 words with keywords
- Include: Spring Cleaning, Home Cleaning, PureTask, NorCal
- Always ends with the URL

### Threads
- Conversational, short
- Twitter energy but warmer
- 1-3 sentences max
- No hashtags needed
- Direct, punchy

### TikTok / YouTube (Video Script)
- For video-style post types: write full script
- For non-video types: write caption + hook line for video repurpose
- Script format: [HOOK - 3 seconds] [BODY - 20 seconds] [CTA - 5 seconds]
- Include: on-screen text suggestions
- Include: B-roll suggestions

---

## SCORING RUBRIC v5.0

Grade like a skeptical consumer. 7 is hard to earn.

- **Clarity (1-10):** Would a complete stranger instantly understand PureTask + what to do?
- **Relatability (1-10):** Would someone stop mid-scroll?
- **Conversion (1-10):** Does this make someone click/book RIGHT NOW?

**Auto-penalties:**
- No image → -3 Conversion
- Missing https://www.puretask.co → -2 Clarity
- Generic hook → -2 Relatability
- Fake stats → -3 Clarity (immediate flag)
- "Cancel anytime" without 48hr caveat → -2 Clarity

**Thresholds:** ≥7.5 = Auto-approve | 5.0-7.4 = Draft | <5.0 = Reject

---

## BRAND FACTS (use only these — no fake stats)

✅ Background-checked before first job
✅ ID verified — real people, real profiles
✅ GPS check-in on arrival — exact minute logged
✅ Before & after photos on every clean — visual proof
✅ Escrow payment — released only when YOU approve
✅ AI-powered matching — right cleaner, not just closest
✅ Reliability Score 0–100 on every cleaner profile
✅ Cleaners keep 80–85% of every booking
✅ 2 grace cancellations per client
✅ Cleaner no-show = full refund + $50 bonus
✅ Book in under 2 minutes
✅ Same cleaner every time — rebook favourites
✅ Weekly or instant Stripe payouts for cleaners
✅ Bronze $20-30/hr | Silver $20-40/hr | Gold $20-50/hr | Platinum $20-65/hr

**NEVER USE:** 10,000+ clients, 4.9★, 98% satisfaction, 2,400+ cleaners (until actually true)
**NEVER SAY:** "cancel anytime" without the 48-hour caveat
**ALWAYS USE:** https://www.puretask.co (not puretask.com, not without https://)

---

## CITY ROTATION (NorCal focus)

Rotate through these cities for local flavor posts:
- San Francisco / Bay Area
- Sacramento
- Roseville / Rocklin (Placer County)
- El Dorado Hills / Folsom
- Grass Valley / Nevada City (Nevada County)
- Oakland / East Bay
- San Jose

City posts: include landmark or recognizable local detail in image prompt.

---

## CONTENT QUALITY STANDARDS

1. Every post must feel like it was written by a real person, not a marketing department
2. Humor posts: actually funny, not cringe-corporate "fun"
3. Story posts: specific details make them real (a name, a time, a feeling)
4. Education posts: one clear concept per post, explained simply
5. Video scripts: writeable in one take, natural speech patterns
6. Poll posts: answer options that people will actually want to vote on
7. Every post must have a clear reason to exist — what does the reader FEEL or LEARN?

# TikTok Research API — application pack (Homework Palette / Chakriya)

TikTok’s stated flow:

1. **Create research account** — professional email (university / research org)  
2. **Submit application** — you, organization, research proposal  
3. **Wait for approval** — typically ~4 weeks  

Sources: [Research API](https://developers.tiktok.com/products/research-api/) · [FAQ](https://developers.tiktok.com/doc/research-api-faq/)

---

## Critical: eligibility

TikTok FAQ:

> **“I am a creator, advertiser, or commercial user. Am I eligible for access to the Research Tools? No.”**

Research Tools are for **academic / eligible not-for-profit researchers** (mainly US, EEA, UK, Canada, Switzerland, etc.), with a **non-commercial** public-interest proposal, funding disclosure, and ethics review.

| Path | Fit for Chakriya | Outcome |
|------|------------------|---------|
| **A. Research API** (01–03) | Only with a real university / research co-PI | Public research metrics after approval |
| **B. Login Kit** (recommended) | Product company / creator | Own `@homeworkpalette` follower stats |

**Do not** apply to Research API just to power [social.chakriya.net](https://social.chakriya.net) — that is commercial Social Ops and matches TikTok’s exclusion.

---

## Path B — recommended (own account)

Client key is already on Vercel. Add a **user** token:

1. TikTok Developers → same app → **Login Kit**  
2. Redirect: `https://socials-seven-beta.vercel.app/api/tiktok/callback`  
3. Scopes: `user.info.basic`, `user.info.profile`, `user.info.stats`  
4. Log in as [@homeworkpalette](https://www.tiktok.com/@homeworkpalette)  
5. Set `TIKTOK_ACCESS_TOKEN` (+ refresh) on Vercel  

Dashboard already prefers `TIKTOK_ACCESS_TOKEN` when present.

### Facts for TikTok app settings

| Item | Value |
|------|--------|
| Display name | Homework Palette |
| Username | homeworkpalette |
| Profile | https://www.tiktok.com/@homeworkpalette |
| Publisher | Chakriya |
| Site | https://homework.chakriya.net/ |
| Contact | contact@chakriya.net |
| App Store | https://apps.apple.com/app/id6801068446 |
| Ops | https://social.chakriya.net/ |

Say if you want Path B coded next (callback route + env save).

---

## Path A — only if you truly qualify

Use a **university / research-org email**. Applicant of record should be the academic org, not Chakriya-as-commercial-publisher. Homework Palette / `@homeworkpalette` can be a **case study subject**.

### 01 — Create research account

- Email: `you@university.edu` (or eligible research org)  
- Region: must match TikTok’s eligible regions for Research Tools  
- Do not rely on `contact@chakriya.net` alone  

### 02 — Submit application (draft text)

**Title**

```
Bilingual (Khmer–English) educational short-form video and family learning
discovery on TikTok: a public-metrics study
```

**About you**

| Field | Fill with |
|-------|-----------|
| Name | `[Legal name]` |
| Email | `[University email]` |
| Affiliation | `[University / lab]` |
| Role | Principal investigator / co-investigator |
| Expertise | Education media / bilingual learning / computational social science `[edit]` |

**Organization**

| Field | Fill with |
|-------|-----------|
| Name | `[University / not-for-profit research body]` |
| Type | Academic or not-for-profit research |
| Website | `[Lab page]` |
| Ethics board | `[IRB / ethics committee name]` |

**Abstract (~200 words)**

```
This independent academic study examines how public educational short-form
video about primary (grades 1–6) homework support reaches families who use
Khmer and/or English. Analysis uses public profile metrics for educational
accounts (including the public account @homeworkpalette as a documented case)
and comparable public edtech content.

Research questions:
1) How do public follower counts and engagement indicators evolve for
   bilingual homework-related educational accounts over time?
2) Which public content themes appear alongside growth in parent-facing
   educational accounts?
3) What are the limits of platform Research Tools for studying educational
   media in lower-resource language communities?

Methods: TikTok Research Tools public fields only (display_name,
follower_count, likes_count, video_count, bio_description, is_verified).
No private messages, no non-public content, no advertising use, no sale of
data. Ethics approval: [IRB reference]. Funding: [grant / academic self-fund].
Retention: aggregates under university policy for [N] months.
```

**Data use statement**

```
Public-interest research only. No commercial redistribution of TikTok Research
Data. No ad targeting. Results may be published in academic notes; raw exports
stay on university-managed systems with access limited to named researchers.
```

**Security / ethics attachments**

- Ethics approval letter PDF  
- Data security summary (university storage, access control, retention)  
- Funding disclosure  

### 03 — Wait for approval

- Typical reply window: **~4 weeks** (TikTok may ask for more info)  
- Save screenshots / confirmation emails  
- After approval, enable Research on the approved org app; Social Ops already calls Research user-info for `homeworkpalette`  

### Path A checklist

- [ ] Confirmed eligible region + academic/non-profit affiliation  
- [ ] University email research account created  
- [ ] Non-commercial proposal (no Social Ops / App Store growth framing)  
- [ ] Ethics review evidence ready  
- [ ] Funding disclosed  
- [ ] Submitted; calendar reminder at +4 weeks  

---

## What not to write on a Research form

- “Power our marketing dashboard / social.chakriya.net”  
- “Grow App Store downloads / Palette Pro”  
- “Brand listening / competitor scrape”  
- Applicant = commercial creator or advertiser only  

Those lines match TikTok’s commercial exclusion.

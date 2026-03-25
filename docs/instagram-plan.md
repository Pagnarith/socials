# Instagram Strategy

## Account Setup

- **Username:** @[yourbrand]
- **Display Name:** [Your Brand Name]
- **Bio:** "🎮 Minecraft Add-ons | 🖥️ Rhino 3D | Building cool stuff daily"
- **Account Type:** Professional (Creator)
- **Category:** Gaming / Education
- **Link in Bio:** Linktree (YouTube, Marketplace, all socials)
- **Linked Facebook Page:** Yes (required for monetization & cross-posting)

## Why Instagram

Instagram shares the **Facebook Graph API** — your existing Facebook App can manage both pages. Reels are algorithmically boosted the same way TikTok works, giving a second channel for short content with near-zero extra production effort.

## Monetization

### Requirements
- [ ] Professional account (Creator or Business)
- [ ] 10,000+ followers (for link stickers, bonuses)
- [ ] Consistent Reels posting
- [ ] Comply with Instagram Partner Monetization Policies

### Revenue Streams

| Stream | Requirement | Est. Revenue |
|--------|------------|--------------|
| Reels Play Bonus (invite-only) | Active Reels creator | $100-1,000/month |
| Branded Content | 5K+ followers | $25-300/post |
| Instagram Shop | Business account | Link to Marketplace |
| Affiliate Links | Any size (link in bio) | 5-15% commission |
| Subscriptions | Eligible creators | $0.99-9.99/month |
| Badges (Live) | Eligible creators | Variable |

## Content Types

### 1. Reels (Primary — 60%)
- **Repurpose TikTok videos directly** (remove TikTok watermark first)
- Rhino 3D speed models (30-90s)
- Minecraft gameplay clips (15-60s)
- Quick tips & tricks
- Trending audio + creative content

### 2. Carousels (25%)
- Step-by-step Rhino 3D tutorials (5-10 slides)
- Minecraft Add-on feature showcase
- Before/after comparisons
- Tips compilations

### 3. Stories (Daily — 15%)
- Daily tip or poll
- Behind-the-scenes workspace
- Q&A stickers
- Countdown to new video/release
- Share new YouTube video link

## Posting Schedule

| Day | Content |
|-----|---------|
| Mon | Rhino 3D Reel (repurpose from TikTok) |
| Tue | Minecraft carousel (Add-on features) |
| Wed | Story: tip of the day + poll |
| Thu | Rhino 3D Reel (repurpose from TikTok) |
| Fri | Q&A Story + engagement |
| Sat | Best moments Reel |
| Sun | Week recap carousel |

**Target:** 4-5 Reels + 2 Carousels + daily Stories per week

## Cross-Posting Workflow

```
1. Create video for TikTok
      ↓
2. Download without watermark (SnapTik or native save)
      ↓
3. Upload same video as Instagram Reel
      ↓
4. Add Instagram-specific hashtags & caption
      ↓
5. Share Reel to Facebook Reel automatically (cross-post toggle)
```

## Hashtag Strategy

### Minecraft
```
#minecraft #minecraftaddon #minecraftbedrock #minecraftgameplay
#minecraftcontent #gamingcommunity #minecraftcreator
```

### Rhino 3D
```
#rhino3d #3dmodeling #3ddesign #rhinoceros #productdesign
#industrialdesign #3dartist #caddesign
```

### Growth
```
#reels #reelsinstagram #tutorial #howto #designtips
#gaming #creator #contentcreator
```

## Integration with Facebook

Since Instagram uses the **Facebook Graph API**, the same `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` manage both platforms. Additional env variables needed:

- `INSTAGRAM_BUSINESS_ACCOUNT_ID` — Your Instagram Business/Creator account ID
- `INSTAGRAM_ACCESS_TOKEN` — Long-lived page token (same as Facebook, with `instagram_basic` + `instagram_content_publish` permissions)

### API Capabilities
- Read follower count & profile metrics
- Get media insights (reach, impressions, engagement)
- Schedule & publish posts programmatically (via Content Publishing API)
- Read comments & reply

## KPIs to Track

- Followers gained per week
- Reels views & reach
- Engagement rate (target: 3-6%)
- Profile visits → link clicks
- Story views & interaction rate
- Revenue from Reels Bonus / branded content

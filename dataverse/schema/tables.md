# Dataverse Schema Definition
# These tables should be created in your Dataverse environment

## Table: Video Contents (cr_videocontents)

| Column | Type | Description |
|--------|------|-------------|
| cr_videocontentid | GUID (PK) | Auto-generated |
| cr_title | Text (200) | Video title |
| cr_description | Text (2000) | Video description |
| cr_platform | Choice | youtube, tiktok, facebook |
| cr_category | Choice | minecraft, rhino3d, general |
| cr_status | Choice | draft, scheduled, recording, editing, published |
| cr_scheduleddate | DateTime | Planned publish date |
| cr_publisheddate | DateTime | Actual publish date |
| cr_videourl | URL | Published video URL |
| cr_thumbnailurl | URL | Thumbnail image URL |
| cr_views | Integer | View count |
| cr_likes | Integer | Like count |
| cr_comments | Integer | Comment count |
| cr_createdon | DateTime | Auto-generated |
| cr_modifiedon | DateTime | Auto-generated |

## Table: Subscribers (cr_subscribers)

| Column | Type | Description |
|--------|------|-------------|
| cr_subscriberid | GUID (PK) | Auto-generated |
| cr_telegramid | Text (50) | Telegram user ID |
| cr_name | Text (100) | User's display name |
| cr_username | Text (100) | Telegram username |
| cr_subscribedat | DateTime | Subscription date |
| cr_isactive | Boolean | Active subscription |
| cr_notifymcrelease | Boolean | Notify on Minecraft Add-on release |
| cr_notifynewvideo | Boolean | Notify on new video upload |

## Table: Revenue (cr_revenues)

| Column | Type | Description |
|--------|------|-------------|
| cr_revenueid | GUID (PK) | Auto-generated |
| cr_platform | Choice | youtube, facebook, tiktok, minecraft_marketplace |
| cr_source | Choice | ads, membership, sponsorship, marketplace_sale, creator_fund, gifts |
| cr_amount | Decimal | Revenue amount |
| cr_currency | Text (3) | Currency code (USD) |
| cr_date | DateTime | Revenue date |
| cr_description | Text (500) | Description/notes |

## Table: Analytics Snapshots (cr_analyticssnapshots)

| Column | Type | Description |
|--------|------|-------------|
| cr_analyticssnaphotid | GUID (PK) | Auto-generated |
| cr_platform | Choice | youtube, facebook, tiktok, telegram |
| cr_date | DateTime | Snapshot date |
| cr_followers | Integer | Follower/subscriber count |
| cr_totalviews | Integer | Total view count |
| cr_engagementrate | Decimal | Engagement rate % |
| cr_watchhours | Decimal | Watch hours (YouTube) |
| cr_revenue | Decimal | Revenue at snapshot time |

## Table: Content Schedule (cr_contentschedule)

| Column | Type | Description |
|--------|------|-------------|
| cr_contentscheduleid | GUID (PK) | Auto-generated |
| cr_title | Text (200) | Content title |
| cr_platform | Choice | youtube, facebook, tiktok |
| cr_category | Choice | minecraft, rhino3d, general |
| cr_scheduleddate | DateTime | Planned date |
| cr_status | Choice | planned, in-progress, recorded, edited, published |
| cr_notes | Text (2000) | Additional notes |

## Relationships

- Video Contents → Content Schedule (1:1 optional lookup)
- Revenue → Video Contents (N:1 optional — revenue linked to specific video)
- Analytics Snapshots → independent (time-series data)
- Subscribers → independent (Telegram bot users)

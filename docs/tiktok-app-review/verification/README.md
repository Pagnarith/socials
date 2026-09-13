# Drop TikTok signature files here

1. In TikTok Developers → app → **URL properties** → verify by **URL prefix**  
2. Enter `https://social.chakriya.net/`  
3. Download the signature file TikTok gives you  
4. Save it in **this folder** (keep the exact filename)  
5. Run:

```bash
node scripts/place-tiktok-url-verification.js
```

Prefer **Domain** verification for `social.chakriya.net` (DNS TXT) when possible — see [VERIFY-URL.md](../VERIFY-URL.md).

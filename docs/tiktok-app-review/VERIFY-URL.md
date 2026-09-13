# Fix: “This URL is not verified” (Terms / Privacy)

The pages are already live (HTTP 200):

- https://social.chakriya.net/terms.html  
- https://social.chakriya.net/privacy.html  
- https://social.chakriya.net/

TikTok still requires **ownership verification** for apps created after 2024-09-09. Filling the URL fields is not enough.

Official steps: [Register Your App → Verify URL ownership](https://developers.tiktok.com/doc/getting-started-create-an-app)

---

## Recommended: verify the whole domain once

Verify **Domain** `social.chakriya.net` (covers Terms, Privacy, and Web URL).

1. TikTok Developers → your app → **Production** mode.  
2. Top of app page → **URL properties**.  
3. **Verify properties**.  
4. Choose **Domain**.  
5. Enter: `social.chakriya.net`  
6. TikTok shows a **DNS TXT** (or similar) record — copy it.  
7. In your DNS host for `chakriya.net` (Cloudflare / registrar):

   | Type | Name / Host | Value |
   |------|-------------|--------|
   | TXT | `social` (or whatever TikTok shows) | `[paste TikTok token]` |

   If TikTok asks for `@` / root, follow their exact host string.

8. Wait for DNS (often 1–15 minutes; sometimes longer).  
9. Back in TikTok → **Verify**.  
10. Status should become **Verified**.

Then keep these form URLs:

```text
Terms of Service URL:  https://social.chakriya.net/terms.html
Privacy Policy URL:    https://social.chakriya.net/privacy.html
Web/Desktop URL:       https://social.chakriya.net/
```

---

## Alternative: URL prefix + signature file

If you prefer not to touch DNS:

1. URL properties → **URL prefix**.  
2. Enter prefix: `https://social.chakriya.net/`  
   (must end with `/`)  
3. Click Verify → **Download signature file**.  
4. Put that file in the repo so GitHub Pages serves it at the path TikTok requires.

TikTok usually wants something like:

```text
https://social.chakriya.net/<signature-filename>
```

### Drop-in helper

1. Save the downloaded file into:

```text
socials/docs/tiktok-app-review/verification/
```

2. Run:

```bash
cd socials
node scripts/place-tiktok-url-verification.js
git add dashboard/public && git commit -m "Add TikTok URL ownership verification file" && git push
```

3. Wait for Pages deploy, open the file URL in a browser (must be **200**, no redirect).  
4. Click **Verify** again in TikTok.

---

## Common failures

| Issue | Fix |
|-------|-----|
| Pages return 404 | Deploy Social Ops Pages; confirm `/terms.html` and `/privacy.html` |
| HTTP redirect (3xx) | TikTok does not follow redirects for ownership checks — use final https URL |
| Only subdomain verified | Verifying `homework.chakriya.net` does **not** cover `social.chakriya.net` |
| Sandbox vs Production | Verify in **Production** mode for app review URLs |
| File not at exact path | Filename/path must match TikTok’s download instructions exactly |

---

## After verified

Re-check the Basic information fields — “This URL is not verified” should clear. Then submit app review with the demo video.

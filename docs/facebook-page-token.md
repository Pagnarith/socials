# Facebook Page-scoped Access Token (how-to)

This snippet shows a safe, repeatable way to obtain a Page-scoped access token from an existing System User token and use it to update Page metadata via the Graph API.

WARNING: Treat any Page access token as a secret. Do not paste it into public places or commit it to git.

Steps

1. In Business Manager (recommended):
   - Business Settings → System Users → Select your System User → Add Assets → Pages → Generate Page Token
   - Copy the generated Page access token and keep it secret.

2. Quick programmatic method (if you already have a valid System User token in `.env` as `FACEBOOK_PAGE_ACCESS_TOKEN`):

   a) Request a Page-scoped token (this returns an access_token you can use to modify the Page):

```bash
# replace values or ensure .env defines PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN
PAGE_ID="1110028448851657"
SYSTEM_TOKEN="$FACEBOOK_PAGE_ACCESS_TOKEN"

curl -s "https://graph.facebook.com/v19.0/${PAGE_ID}?fields=access_token&access_token=${SYSTEM_TOKEN}" | jq .
```

The response contains `access_token` — this is the Page-scoped token. Example field:

```json
{
  "access_token": "EAA...",
  "id": "1110028448851657"
}
```

b) Use the returned token to update Page fields (example: `about`, `description`, `website`):

```bash
PAGE_TOKEN="<PAGE_SCOPED_TOKEN_FROM_PREVIOUS_STEP>"
PAGE_ID="1110028448851657"

# Update short about
curl -X POST "https://graph.facebook.com/v19.0/${PAGE_ID}" \
  --data-urlencode "about=Short about text here" \
  --data-urlencode "access_token=${PAGE_TOKEN}"

# Update long description
curl -X POST "https://graph.facebook.com/v19.0/${PAGE_ID}" \
  --data-urlencode "description=$(< ./docs/platform-bios.md sed -n '1,80p')" \
  --data-urlencode "access_token=${PAGE_TOKEN}"

# Set website
curl -X POST "https://graph.facebook.com/v19.0/${PAGE_ID}" \
  -d "website=https://social.chakriya.net" \
  -d "access_token=${PAGE_TOKEN}"
```

Notes

- If you get `(#210) A page access token is required`, the token you used is not the correct Page-scoped token — generate one in Business Manager or use the programmatic GET shown above to obtain it.
- The Programmatic GET works when your System User token has enough scopes (e.g., `pages_show_list`, `pages_manage_posts`, `pages_manage_metadata`). The debug output will list the scopes.
- Instagram profile biography cannot be changed via the Instagram Graph API in most cases — update IG bio manually.
- Store long-lived Page tokens securely (secrets manager, GitHub Actions secrets, etc.). If you believe a token is leaked, revoke it in Business Manager immediately.

If you want, I can add a short `Makefile` target or a script in `scripts/` to automate the token fetch + update (will require the tokens available in the environment). Ask and I'll implement.

import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'
import readline from 'readline'
import {google} from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/youtube']
const TOKEN_PATH = 'tokens/youtube.json'

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, (answer) => { rl.close(); resolve(answer) })
  })
}

async function main() {
  const clientId = process.env.YT_CLIENT_ID
  const clientSecret = process.env.YT_CLIENT_SECRET
  const redirectUri = process.env.YT_REDIRECT_URI || 'http://localhost:3000/oauth2callback'

  if (!clientId || !clientSecret) {
    console.error('Missing YT_CLIENT_ID or YT_CLIENT_SECRET in .env')
    process.exit(1)
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

  // Load existing token if present
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'))
    oAuth2Client.setCredentials(token)
    console.log('Loaded existing YouTube token from', TOKEN_PATH)
  } else {
    const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent' })
    console.log('\nAuthorize this app by visiting this url:\n')
    console.log(authUrl)
    console.log('\nAfter allowing access, copy the code param from the redirected URL and paste it below.')

    // If caller only wants the auth URL printed, exit now
    if (process.argv.includes('--print-auth-url') || process.env.PRINT_AUTH_URL_ONLY === '1') {
      process.exit(0)
    }

    const code = (await ask('\nEnter the code here: ')).trim()
    const { tokens } = await oAuth2Client.getToken(code)
    oAuth2Client.setCredentials(tokens)
    fs.mkdirSync('tokens', { recursive: true })
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2))
    console.log('Saved token to', TOKEN_PATH)
  }

  const youtube = google.youtube({ version: 'v3', auth: oAuth2Client })

  // Find the authenticated user's channel
  const listRes = await youtube.channels.list({ part: 'brandingSettings', mine: true })
  if (!listRes.data.items || listRes.data.items.length === 0) {
    console.error('No channel found for authenticated user')
    process.exit(1)
  }
  const channel = listRes.data.items[0]
  const channelId = channel.id
  console.log('Found channel id:', channelId)

  // Accept description from args or prompt
  let newDesc = process.argv.slice(2).join(' ').trim()
  if (!newDesc) {
    newDesc = (await ask('Enter new channel description (or leave empty to abort): ')).trim()
  }
  if (!newDesc) { console.log('Aborted: no description provided'); process.exit(0) }

  // Update channel brandingSettings.channel.description
  const updateRes = await youtube.channels.update({
    part: 'brandingSettings',
    requestBody: {
      id: channelId,
      brandingSettings: {
        channel: {
          description: newDesc
        }
      }
    }
  })

  console.log('Update result:', updateRes.data)
  console.log('Channel description updated successfully.')
}

main().catch(err => { console.error('Error updating YouTube channel:', err); process.exit(1) })

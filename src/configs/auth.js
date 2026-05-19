import { getAppConfig, getDomain } from 'src/Components/_Shared'

const authSettings = {
  authority: process.env.IDENTITY_URL,
  client_id: getAppConfig().client_id,
  client_secret: getAppConfig().client_secret,
  redirect_uri: getDomain() + 'oauth/callback',
  silent_redirect_uri: getDomain() + 'oauth/callback',
  post_logout_redirect_uri: getDomain(),
  response_type: 'code',
  scope: 'openid profile email api1'
}

export const authConfig = {
  settings: authSettings,
  flow: 'auth'
}

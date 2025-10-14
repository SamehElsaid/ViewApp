import { getDomain } from "src/Components/axiosCall";

const authSettings = {
  authority: process.env.IDENTITY_URL,
  client_id: 'VIEW.APP',
  client_secret: '901564A5-E7FE-42CB-B10D-61EF6A8F3658',
  redirect_uri: getDomain() + 'oauth/callback',
  silent_redirect_uri: getDomain() + 'oauth/callback',
  post_logout_redirect_uri: getDomain(),
  response_type: 'code',
  scope: 'openid profile email api1'
};
 
export const authConfig = {
  settings: authSettings,
  flow: 'auth'
};



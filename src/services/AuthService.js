import { UserManager } from 'oidc-client-ts'
import { authConfig } from 'src/configs/auth'

const userManager = new UserManager(authConfig.settings)

export async function getUser() {
  const user = await userManager.getUser()
  if (user) {
    console.log('User Info:', user?.profile?.role) // Contains UserInfo claims
  } else {
    console.log('User not logged in.')
  }

  return user
}

export async function isAuthenticated() {
  let token = await getAccessToken()

  return !!token
}

export async function handleOAuthCallback(callbackUrl) {
  try {
    const user = await userManager.signinRedirectCallback(callbackUrl)

    return user
  } catch (e) {
    alert(e)
    console.log(`error while handling oauth callback: ${e}`)
  }
}

export async function sendOAuthRequest() {
  return await userManager.signinRedirect()
}

// renews token using refresh token
export async function renewToken() {
  const user = await userManager.signinSilent()

  return user
}

export async function getAccessToken() {
  const user = await getUser()

  return user?.access_token
}

export async function logout() {
  await userManager.clearStaleState()
  await userManager.signoutRedirect()
}

export async function getRole() {
  const user = await getUser()

  return user?.profile?.role
}

/**
 * Auth0 Post-Login Action: gives every user without roles the default "cliente" role
 * (write:payments + read:profile), so newly registered users can buy.
 *
 * Secrets (Action → Settings → Secrets):
 *   DOMAIN           dev-vx0d4nhti2zb58wx.us.auth0.com
 *   CLIENT_ID        Machine-to-Machine app authorized for the Auth0 Management API with the `update:users` scope
 *   CLIENT_SECRET    that app's secret
 *   DEFAULT_ROLE_ID  rol_9MyYW4iky4U32daz  ("cliente" role: read:profile + write:payments)
 *
 * The access token from this same login is issued before the role exists; the frontend
 * requests a fresh token right after (PermissionsContext.tsx), which already includes the permissions.
 */
exports.onExecutePostLogin = async (event, api) => {
  const alreadyHasRoles = (event.authorization?.roles ?? []).length > 0;
  if (alreadyHasRoles) return;

  try {
    const managementToken = await requestManagementToken(event.secrets);
    const userId = encodeURIComponent(event.user.user_id);
    const response = await fetch(`https://${event.secrets.DOMAIN}/api/v2/users/${userId}/roles`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${managementToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles: [event.secrets.DEFAULT_ROLE_ID] }),
    });
    if (!response.ok) {
      console.log(`Could not assign default role to ${event.user.user_id}: ${response.status} ${await response.text()}`);
    }
  } catch (error) {
    // Never block the login: the user can still browse, and the next login retries the assignment.
    console.log(`Default role assignment failed for ${event.user.user_id}: ${error.message}`);
  }
};

async function requestManagementToken({ DOMAIN, CLIENT_ID, CLIENT_SECRET }) {
  const response = await fetch(`https://${DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: `https://${DOMAIN}/api/v2/`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Management token request failed: ${response.status}`);
  }
  const { access_token } = await response.json();
  return access_token;
}

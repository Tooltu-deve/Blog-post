import { Amplify } from 'aws-amplify';

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const domain = import.meta.env.VITE_COGNITO_DOMAIN;
const redirectUrl =
  import.meta.env.VITE_COGNITO_REDIRECT_URL ??
  `${window.location.origin}/auth/callback`;
const logoutUrl =
  import.meta.env.VITE_COGNITO_LOGOUT_URL ?? `${window.location.origin}/`;

if (!userPoolId || !userPoolClientId || !domain) {
  throw new Error(
    'Missing VITE_COGNITO_USER_POOL_ID / VITE_COGNITO_CLIENT_ID / VITE_COGNITO_DOMAIN',
  );
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      loginWith: {
        email: true,
        oauth: {
          domain,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [redirectUrl],
          redirectSignOut: [logoutUrl],
          responseType: 'code',
        },
      },
    },
  },
});

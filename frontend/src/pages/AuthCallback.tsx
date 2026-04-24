import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hub } from 'aws-amplify/utils';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refresh } = useAuth();

  useEffect(() => {
    // Amplify completes the OAuth code exchange automatically on page load
    // and emits `signedIn` on success. We just wait and redirect.
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') {
        refresh().then(() => navigate('/'));
      } else if (payload.event === 'signInWithRedirect_failure') {
        navigate('/login?error=oauth');
      }
    });
    return () => unsubscribe();
  }, [navigate, refresh]);

  return (
    <main className="container">
      <p className="loading-text">Completing sign-in…</p>
    </main>
  );
}

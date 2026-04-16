import React from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GoogleAuth = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      
      const result = await googleLogin(credentialResponse.credential);
      
      if (result.success) {
        navigate('/');
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 rounded-xl text-sm text-center">
          {error}
        </div>
      )}
      
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google login failed')}
          useOneTap={false}
          theme="filled_black"
          size="large"
          text="continue_with"
          shape="pill"
          width="100%"
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default GoogleAuth;
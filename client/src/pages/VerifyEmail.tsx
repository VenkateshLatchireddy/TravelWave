import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth } from '../utils/auth';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification token');
        return;
      }

      const success = await auth.verifyEmail(token);
      if (success) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } else {
        setStatus('error');
        setMessage('Failed to verify email. The token may have expired.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-100">Verifying your email...</h2>
              <p className="text-slate-400 mt-2">Please wait while we confirm your email address</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-100">Email Verified!</h2>
              <p className="text-slate-400 mt-2">{message}</p>
              <Link
                to="/login"
                className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                Continue to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-100">Verification Failed</h2>
              <p className="text-slate-400 mt-2">{message}</p>
              <div className="mt-6 space-y-3">
                <Link
                  to="/login"
                  className="block px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all"
                >
                  Back to Login
                </Link>
                <Link
                  to="/"
                  className="block text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Go to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
import React, { useEffect, useRef, useState } from 'react';

/**
 * ArcShield Google Sign-In Component
 * Uses official Google Identity Services (GIS) library to prompt user and obtain verified ID token.
 */
export default function GoogleSignInButton({ 
  onSuccess, 
  onError, 
  text = 'continue_with', // 'continue_with' | 'signup_with' | 'signin_with'
  disabled = false 
}) {
  const containerRef = useRef(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [configError, setConfigError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let checkInterval = null;

    const initGis = () => {
      if (!window.google?.accounts?.id) {
        return false;
      }

      if (!clientId) {
        // Not configured yet
        return true;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response && response.credential) {
              onSuccess(response.credential);
            } else {
              onError?.('No credential returned by Google Identity Services.');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(containerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: text === 'signup_with' ? 'signup_with' : 'continue_with',
            logo_alignment: 'left',
            width: 360
          });
        }
        setGisLoaded(true);
        return true;
      } catch (err) {
        console.error('[ArcShield] Google Identity Services init error:', err);
        return false;
      }
    };

    // Attempt immediate initialization
    if (!initGis()) {
      // Poll briefly for script load if async defer is still executing
      let attempts = 0;
      checkInterval = setInterval(() => {
        attempts++;
        if (initGis() || attempts > 25) {
          clearInterval(checkInterval);
          if (window.google?.accounts?.id) {
            setGisLoaded(true);
          }
        }
      }, 200);
    } else {
      setGisLoaded(true);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [clientId, text, onSuccess, onError]);

  const handleManualClick = () => {
    if (!clientId) {
      setConfigError('Google Sign-In requires VITE_GOOGLE_CLIENT_ID to be configured in your environment.');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn('[Google GIS] Prompt suppressed or skipped:', notification.getNotDisplayedReason?.());
        }
      });
    } else {
      onError?.('Google Identity Services script is still loading. Please check your internet connection.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {configError && (
        <div className="w-full mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 text-center">
          {configError}
        </div>
      )}

      {/* Official GIS container */}
      <div 
        ref={containerRef} 
        className={`w-full flex justify-center ${gisLoaded && clientId ? 'block' : 'hidden'}`}
        style={{ minHeight: '44px' }}
      />

      {/* Styled fallback button when GIS script is loading or rendering */}
      {(!gisLoaded || !clientId) && (
        <button
          type="button"
          onClick={handleManualClick}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.66-5.18 3.66-9.12z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.43l4.03-3.14z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span>{text === 'signup_with' ? 'Sign up with Google' : 'Continue with Google'}</span>
        </button>
      )}
    </div>
  );
}

import { useGoogleAuth } from '@/api/query-hooks/auth.hooks';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import googleIcon from "../../assets/images/Google.png"
import { useEffect, useRef } from 'react';
import "./Login.css"

export const GoogleAuthButton = () => {
    const { mutate, isPending } = useGoogleAuth();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const pendingAuth = sessionStorage.getItem('oauth_pending');
  
    // Unified loading state
    const isLoading = isPending || !!pendingAuth;
  
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Visual feedback during actual unload
            if (buttonRef.current) {
              buttonRef.current.style.opacity = '0.5';
              buttonRef.current.style.cursor = 'not-allowed';
            }
        };
        
        // Auto-cleanup after 30 seconds
        const timeout = setTimeout(() => {
          sessionStorage.removeItem('oauth_pending');
        }, 30000);
      
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
          clearTimeout(timeout); // Critical cleanup
          window.removeEventListener('beforeunload', handleBeforeUnload);
          
          if (!window.location.href.includes('google')) {
            sessionStorage.removeItem('oauth_pending');
          }
        };
    }, []);
    
      
  
    return (
      <Button
        ref={buttonRef}
        onClick={() => {
          sessionStorage.setItem('oauth_pending', 'true');
          mutate();
        }}
        disabled={isLoading}
        data-pending={isLoading}
        variant="outline"
        className="w-full relative py-3 px-[10px] flex items-center justify-center gap-2 border rounded-md hover:bg-gray-50 transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting to Google...
          </div>
        ) : (
          <>
            <img 
              src={googleIcon} 
              className="w-5 h-5 mr-2"
              alt="Google"
            />
            Continue with Google
          </>
        )}
      </Button>
    );
  };
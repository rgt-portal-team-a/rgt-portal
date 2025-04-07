// src/components/common/CookiePermissionBanner.tsx
import { useEffect, useState } from "react";
import {
  checkThirdPartyCookies,
  setBannerDismissed,
  getBannerDismissed,
} from "@/lib/utils";

export const CookiePermissionBanner = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    const verifyCookies = async () => {
      const cookiesEnabled = await checkThirdPartyCookies();
      const dismissed = getBannerDismissed();

      if (!cookiesEnabled && !dismissed) {
        setShowBanner(true);
      }
    };

    verifyCookies();
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    setBannerDismissed(true);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 border-t border-gray-300 z-50 flex justify-between items-center">
      <div className="max-w-4xl mx-auto">
        <h4 className="text-lg font-semibold mb-2">
          Third-Party Cookies Required
        </h4>
        <p className="mb-2">
          This application requires third-party cookies to function properly.
          Please enable third-party cookies in your browser settings.
        </p>
        <div className="text-sm">
          <p className="font-medium mb-1">
            How to enable in different browsers:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Chrome:</strong> Settings → Privacy and security → Cookies
              and other site data → Allow third-party cookies
            </li>
            <li>
              <strong>Firefox:</strong> Options → Privacy & Security → Enhanced
              Tracking Protection → Custom → Cookies
            </li>
            <li>
              <strong>Safari:</strong> Preferences → Privacy → Cookies and
              website data → Allow from websites I visit
            </li>
          </ul>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ml-4"
      >
        Dismiss
      </button>
    </div>
  );
};

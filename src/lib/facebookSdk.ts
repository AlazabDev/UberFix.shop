interface FacebookWindow extends Window {
  fbAsyncInit?: () => void;
  FB?: {
    init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
    AppEvents?: { logPageView?: () => void };
  };
}

const FACEBOOK_SCRIPT_ID = "facebook-jssdk";

const ensureFacebookScript = () => {
  if (document.getElementById(FACEBOOK_SCRIPT_ID)) return;
  const js = document.createElement("script");
  js.id = FACEBOOK_SCRIPT_ID;
  js.src = "https://connect.facebook.net/ar_AR/sdk.js";
  js.async = true;
  document.body.appendChild(js);
};

export const initFacebookSdk = () => {
  if (typeof window === "undefined") return;

  const appId = import.meta.env.VITE_FACEBOOK_APP_ID || "YOUR_FACEBOOK_APP_ID";
  const fbWindow = window as FacebookWindow;

  if (fbWindow.FB) {
    fbWindow.FB.init({ appId, cookie: true, xfbml: true, version: "v21.0" });
    fbWindow.FB.AppEvents?.logPageView?.();
    return;
  }

  fbWindow.fbAsyncInit = function fbInit() {
    fbWindow.FB?.init({ appId, cookie: true, xfbml: true, version: "v21.0" });
    fbWindow.FB?.AppEvents?.logPageView?.();
  };

  ensureFacebookScript();
};

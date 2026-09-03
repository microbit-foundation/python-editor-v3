/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode, createContext, useEffect, useState } from "react";
import { CookieConsent, DeploymentConfig } from "../deployment";
import { isStageWithAnalytics } from "../logging/stage";

/**
 * Surface of the shared-assets `commonConsent` API
 * (https://shared-assets.microbit.org/common/v2/common.js) that we depend
 * on. Defined here only to give the compliance code a typed handle on
 * `window` — the script itself is the authoritative source of behaviour.
 */
interface CommonConsent {
  show: (opts: { userTriggered?: boolean; config: ConsentConfig }) => void;
  hide: () => void;
}

interface ConsentConfig {
  ga: Record<string, never> | undefined;
  custom: Array<{
    type: string;
    category: string;
    name: string;
    purpose: string;
  }>;
}

type CommonConsentWindow = Window & {
  commonConsent?: CommonConsent;
};

/**
 * Web compliance backed by the shared-assets `commonConsent` API. Shows
 * the cookie modal, listens for `consentchange`, and exposes a
 * `manageCookies` callback that re-opens the modal on user request.
 * Embedded sites (`window.self !== window.top`) assume the parent
 * handles notices so we no-op there.
 */
export const createWebCompliance = (
  env: Record<string, string>
): DeploymentConfig["compliance"] => {
  const consentContext = createContext<CookieConsent | undefined>(undefined);

  const config: ConsentConfig = {
    ga: isStageWithAnalytics(env.VITE_STAGE) ? {} : undefined,
    custom: [
      {
        type: "session",
        category: "essential",
        name: "sessionSettings",
        purpose: "Used to disable hints based on your prior actions",
      },
      {
        type: "local",
        category: "essential",
        name: "release-notice",
        purpose:
          "Records which version of the first-time-use notice you've seen so we can decide to show or suppress it in future",
      },
      {
        type: "local",
        category: "essential",
        name: "settings",
        purpose:
          "Used to store your settings and remember which dialogs you've opted not to be shown in future",
      },
    ],
  };

  const showConsent = (
    { userTriggered }: { userTriggered: boolean } = { userTriggered: false }
  ) => {
    (window as CommonConsentWindow).commonConsent?.show({
      userTriggered,
      config,
    });
  };

  const hideConsent = () => {
    (window as CommonConsentWindow).commonConsent?.hide();
  };

  const manageCookies = () => showConsent({ userTriggered: true });

  const ConsentProvider = ({ children }: { children: ReactNode }) => {
    const [value, setValue] = useState<CookieConsent | undefined>(undefined);
    useEffect(() => {
      // If we're embedded we assume the embedding site is taking
      // responsibility for required notices to avoid nested cookie modals.
      if (inIframe()) {
        return;
      }
      const w = window as CommonConsentWindow;
      const updateListener = (event: Event) => {
        setValue((event as CustomEvent<CookieConsent>).detail);
      };
      const initListener = () => showConsent();
      w.addEventListener("consentchange", updateListener);
      if (w.commonConsent) {
        showConsent();
      } else {
        w.addEventListener("consentinit", initListener);
      }
      return () => {
        w.removeEventListener("consentchange", updateListener);
        w.removeEventListener("consentinit", initListener);
        hideConsent();
      };
    }, []);

    return (
      <consentContext.Provider value={value}>
        {children}
      </consentContext.Provider>
    );
  };

  return { ConsentProvider, consentContext, manageCookies };
};

const inIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

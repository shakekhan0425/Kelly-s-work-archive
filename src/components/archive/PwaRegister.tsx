"use client";

import { useEffect, useState } from "react";

type BeforeInstall = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * 注册 Service Worker，并提供：
 *  - 安装提示（beforeinstallprompt 捕获后展示「添加到主屏幕」横幅）
 *  - 更新提示（新 SW 就绪后展示「刷新以更新」横幅）
 */
export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstall | null>(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        setSwReg(reg);
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          installing?.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              setShowUpdate(true);
            }
          });
        });
      }).catch((e) => console.warn("[pwa] SW 注册失败：", e));
    };
    window.addEventListener("load", onLoad);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstall);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall as EventListener);

    return () => {
      window.removeEventListener("load", onLoad);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall as EventListener);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const applyUpdate = () => {
    if (!swReg) return;
    const waiting = swReg.waiting;
    waiting?.postMessage({ type: "SKIP_WAITING" });
    setShowUpdate(false);
    window.location.reload();
  };

  if (!deferredPrompt && !showUpdate) return null;

  return (
    <div className="pwa-banner" role="status">
      {deferredPrompt ? (
        <>
          <span className="pwa-banner__txt">可添加到主屏幕，像 App 一样离线使用</span>
          <button className="pwa-banner__btn" onClick={install}>安装</button>
          <button className="pwa-banner__x" onClick={() => setDeferredPrompt(null)} aria-label="关闭">×</button>
        </>
      ) : null}
      {showUpdate ? (
        <>
          <span className="pwa-banner__txt">已有新版本可用</span>
          <button className="pwa-banner__btn" onClick={applyUpdate}>刷新更新</button>
        </>
      ) : null}
    </div>
  );
}

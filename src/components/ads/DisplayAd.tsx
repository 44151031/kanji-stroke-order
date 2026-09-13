"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const CLIENT = "ca-pub-6887407803306740";
const SLOTS = {
  kanji: "8309619835",
  article: "8457793644",
} as const;

/** 1ページ1枠。公開ホストで、画面に近づいたときだけ広告を要求する。 */
export default function DisplayAd({ placement }: { placement: keyof typeof SLOTS }) {
  const container = useRef<HTMLElement>(null);
  const unit = useRef<HTMLModElement>(null);
  const requested = useRef(false);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    // ローカル・プレビューで本物の広告リクエストを発生させない。
    if (!["kanji-stroke-order.com", "www.kanji-stroke-order.com"].includes(window.location.hostname)) return;
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && element.clientWidth > 0) {
        setNearViewport(true);
        observer.disconnect();
      }
    }, { rootMargin: "400px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function requestAd() {
    const element = unit.current;
    if (!element || !element.isConnected || element.clientWidth === 0 || requested.current || element.dataset.adsbygoogleStatus) return;
    requested.current = true;
    try {
      const adWindow = window as Window & { adsbygoogle?: { push: (value: Record<string, never>) => unknown } };
      const queue = adWindow.adsbygoogle || ([] as Record<string, never>[]);
      adWindow.adsbygoogle = queue;
      queue.push({});
    } catch {
      // 広告ブロッカー等があっても学習操作に影響させない。自動再要求はしない。
    }
  }

  return (
    <aside ref={container} aria-label="広告" data-ad-placement={placement}
      className="mx-auto my-8 w-full max-w-[728px]" style={{ minHeight: 278 }}>
      <p className="mb-2 text-center text-xs text-muted-foreground">広告</p>
      {/* Google公式の「可変幅・固定高さ」方式。未配信でも領域を縮めずCLSを防ぐ。 */}
      <ins ref={unit} className="adsbygoogle"
        style={{ display: "block", width: "100%", maxWidth: 728, height: 250 }}
        data-ad-client={CLIENT} data-ad-slot={SLOTS[placement]} />
      {nearViewport && <Script id="adsense-display" strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`}
        crossOrigin="anonymous" onReady={requestAd} />}
    </aside>
  );
}

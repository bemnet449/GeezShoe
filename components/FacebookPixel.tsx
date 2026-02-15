"use client";

/**
 * Production-ready Facebook (Meta) Pixel integration for Next.js App Router.
 *
 * Set NEXT_PUBLIC_FB_PIXEL_ID in your environment (e.g. .env.local) to enable.
 *
 * Automatic tracking:
 * - PageView on every page/route change
 * - ViewContent on product/detail pages (URL matches /clients/product/[id], /product/[id], etc.)
 *   or any element with data-fb-viewcontent="true"
 *
 * Click tracking: add these attributes to buttons/links:
 * - data-fb-event: "AddToCart" | "Purchase" | "InitiateCheckout"
 * - data-fb-value (optional): number (e.g. price or order total)
 * - data-fb-currency (optional): default "ETB" (Birr)
 * - data-fb-content-name (optional): overrides content_name (default: button text)
 * - data-fb-content-id (optional): product/content ID for Purchase/AddToCart
 */
import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

/** Meta Pixel fbq function and stub API */
type FbqAction = "init" | "track" | "trackCustom";
type FbqFunction = (
  action: FbqAction,
  eventName: string,
  params?: Record<string, unknown>
) => void;

interface FbqStub extends FbqFunction {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
}

declare global {
  interface Window {
    fbq?: FbqStub;
    _fbq?: FbqStub;
  }
}

// Normalize pixel ID (handles "id=5615439315156046" -> "5615439315156046")
const rawPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const PIXEL_ID = rawPixelId
  ? String(rawPixelId).replace(/^id=/, "").trim() || undefined
  : undefined;

/** URL patterns that indicate a product/detail page for ViewContent */
const VIEW_CONTENT_PATHS = [
  /^\/clients\/product\/[^/]+$/,
  /^\/product\/[^/]+$/,
  /\/product\/.+/,
  /\/detail\/.+/,
];

const DEFAULT_CURRENCY = "ETB";
const FB_SCRIPT_URL = "https://connect.facebook.net/en_US/fbevents.js";
const FB_PIXEL_SCRIPT_ID = "fb-pixel-script";

function isViewContentPage(pathname: string): boolean {
  return VIEW_CONTENT_PATHS.some((re) => re.test(pathname));
}

function hasViewContentAttribute(): boolean {
  if (typeof document === "undefined") return false;
  return document.querySelector('[data-fb-viewcontent="true"]') !== null;
}

/** Extract product/content ID from pathname (e.g. /clients/product/123 -> "123") */
function extractContentIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/\/(?:product|detail)\/([^/]+)/i);
  return match ? match[1] : undefined;
}

/** Load Meta Pixel script using the official stub pattern */
function loadPixelScript(pixelId: string): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(FB_PIXEL_SCRIPT_ID)) return;

  const w = window;
  const f = w;
  const b = document;
  const e = "script";
  const v = FB_SCRIPT_URL;

  const n = (f.fbq = function (
    ...args: [FbqAction, string, Record<string, unknown>?]
  ) {
    (n as FbqStub).callMethod
      ? (n as FbqStub).callMethod!.apply(n, args)
      : (n as FbqStub).queue.push(args);
  }) as FbqStub;

  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [] as unknown[][];

  const t = b.createElement(e) as HTMLScriptElement;
  t.async = true;
  t.src = v;
  t.id = FB_PIXEL_SCRIPT_ID;
  const s = b.getElementsByTagName(e)[0];
  if (s.parentNode) s.parentNode.insertBefore(t, s);
}

export default function FacebookPixel() {
  const pathname = usePathname();
  const initialized = useRef(false);
  const lastPathname = useRef<string | null>(null);
  const lastViewContentPath = useRef<string | null>(null);

  const safeTrack = useCallback(
    (eventName: string, params?: Record<string, unknown>) => {
      if (typeof window === "undefined" || !window.fbq) return;
      try {
        window.fbq("track", eventName, params);
      } catch {
        // Suppress tracking errors in production
      }
    },
    []
  );

  // Initialize pixel and track PageView on mount / route change
  useEffect(() => {
    if (!PIXEL_ID || typeof window === "undefined") return;

    if (!initialized.current) {
      loadPixelScript(PIXEL_ID);
      window.fbq!("init", PIXEL_ID);
      window.fbq!("track", "PageView");
      initialized.current = true;
      lastPathname.current = pathname;
    } else if (pathname !== lastPathname.current) {
      safeTrack("PageView");
      lastPathname.current = pathname;
    }
  }, [pathname, safeTrack]);

  // ViewContent: product/detail pages (URL or data-fb-viewcontent)
  useEffect(() => {
    if (!PIXEL_ID || !initialized.current || typeof window === "undefined")
      return;

    const shouldTrack =
      isViewContentPage(pathname) || hasViewContentAttribute();
    if (!shouldTrack) {
      lastViewContentPath.current = null;
      return;
    }

    // Avoid duplicate ViewContent on same page (e.g. re-renders)
    if (lastViewContentPath.current === pathname) return;
    lastViewContentPath.current = pathname;

    const timeoutId = setTimeout(() => {
      if (!window.fbq) return;

      const pageUrl =
        typeof window !== "undefined" ? window.location.href : "";
      const contentId =
        extractContentIdFromPath(pathname) ||
        document
          .querySelector('[data-fb-viewcontent="true"]')
          ?.getAttribute("data-fb-content-id")
          ?.trim();
      const contentName =
        document
          .querySelector('[data-fb-viewcontent="true"]')
          ?.getAttribute("data-fb-content-name")
          ?.trim() || document.title || undefined;

      const params: Record<string, unknown> = {
        page_url: pageUrl,
        content_name: contentName,
      };
      if (contentId) params.content_ids = [contentId];
      params.content_type = "product";

      safeTrack("ViewContent", params);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [pathname, safeTrack]);

  // Global click delegation for data-fb-event buttons
  useEffect(() => {
    if (!PIXEL_ID || typeof document === "undefined") return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest?.("[data-fb-event]") as
        | (HTMLButtonElement | HTMLAnchorElement & { href?: string })
        | null;
      if (!button) return;

      const eventName = button.getAttribute("data-fb-event");
      if (!eventName) return;

      const pageUrl = window.location.href;
      const contentName =
        button.getAttribute("data-fb-content-name")?.trim() ||
        button.textContent?.trim() ||
        undefined;
      const contentId = button.getAttribute("data-fb-content-id")?.trim();
      const valueRaw = button.getAttribute("data-fb-value");
      const value =
        valueRaw != null && valueRaw !== ""
          ? parseFloat(valueRaw)
          : undefined;
      const currency =
        button.getAttribute("data-fb-currency")?.trim() || DEFAULT_CURRENCY;

      const params: Record<string, unknown> = {
        page_url: pageUrl,
        content_name: contentName,
        currency,
      };
      if (value != null && !Number.isNaN(value)) params.value = value;
      if (contentId) params.content_ids = [contentId];

      try {
        window.fbq?.("track", eventName, params);
      } catch {
        // Suppress tracking errors
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!PIXEL_ID) return null;

  return (
    <>
      {/* Noscript fallback: 1x1 image for PageView when JS is disabled */}
      <noscript>
        <img
          height={1}
          width={1}
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

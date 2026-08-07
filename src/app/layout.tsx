import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PRODUCT } from "@/lib/config/product";
import { PwaRegister } from "@/components/archive/PwaRegister";
import { MobileTabBar } from "@/components/archive/MobileTabBar";

/**
 * 全站 ISR：页面在运行时直读 Supabase，采集写库后最多 5 分钟自动上线，
 * 无需重新构建。子路由可单独覆盖（如 /favorites 已是 force-dynamic）。
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    default: `${PRODUCT.name} · ${PRODUCT.subtitle}`,
    template: `%s · ${PRODUCT.name}`,
  },
  description: PRODUCT.description,
  applicationName: PRODUCT.name,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: PRODUCT.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Editorial type system — loaded at runtime so the build needs no
            outbound fetch. See master prompt §4.4. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,500&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,500&family=Barlow+Condensed:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <MobileTabBar />
        <PwaRegister />
      </body>
    </html>
  );
}

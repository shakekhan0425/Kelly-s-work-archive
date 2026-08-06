import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WORK / Archive · 营销情报工作台",
    short_name: "WORK Archive",
    description: "跨行业营销情报、品牌案例、公司研究与播客情报的市场营销情报平台。",
    start_url: "/desk",
    scope: "/",
    display: "standalone",
    background_color: "#1a1410",
    theme_color: "#791925",
    lang: "zh-CN",
    dir: "ltr",
    categories: ["business", "education", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

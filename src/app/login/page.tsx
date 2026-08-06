"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PRODUCT } from "@/lib/config/product";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get("error");

  const enterDemo = () => {
    document.cookie = "wa_demo=1; path=/; max-age=" + 60 * 60 * 24 * 7;
    router.push("/desk");
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <div>
          <div
            className="font-italic"
            style={{ fontSize: 22, opacity: 0.85 }}
          >
            The
          </div>
          <h1
            style={{
              fontSize: 40,
              color: "var(--color-paper-light)",
              margin: "2px 0 10px",
            }}
          >
            {PRODUCT.name}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif-cn)",
              opacity: 0.9,
              maxWidth: 360,
            }}
          >
            {PRODUCT.description}
          </p>
        </div>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            opacity: 0.85,
            fontSize: 14,
            lineHeight: 2,
          }}
        >
          <li>· 每日不过载的行业情报</li>
          <li>· 美妆护肤 / 消费 / 时尚 / AI 商业知识沉淀</li>
          <li>· 真实公司档案与面试准备</li>
          <li>· 小红书 / 抖音 / Campaign / 作品集灵感</li>
        </ul>
      </aside>

      <div className="auth-form">
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            公开演示
          </div>
          <h2 style={{ fontSize: 26, marginBottom: 18 }}>进入档案馆</h2>

          {error ? (
            <div
              className="stamp"
              style={{ marginBottom: 14, display: "inline-flex" }}
            >
              登录失败，请检查邮箱与密码
            </div>
          ) : null}

          <p
            style={{
              fontSize: 13,
              color: "var(--color-ink-muted)",
              marginBottom: 14,
            }}
          >
            这是一个公开演示站点，无需登录即可浏览全部真实抓取内容。点击下方按钮进入档案馆。
          </p>
          <button
            className="btn btn-primary"
            type="button"
            style={{ width: "100%" }}
            onClick={enterDemo}
          >
            进入演示模式
          </button>

          <p style={{ marginTop: 22, fontSize: 12 }}>
            <Link
              href="/onboarding"
              style={{ color: "var(--color-archive-red)" }}
            >
              了解首次引导流程 →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

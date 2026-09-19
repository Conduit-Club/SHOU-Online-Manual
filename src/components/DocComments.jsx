import React, { useEffect, useRef, useState } from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const SCRIPT_ID = "shou-twikoo-script";

function getTwikooConfig(siteConfig) {
  const config = siteConfig.customFields?.twikoo;

  return {
    enabled: config?.enabled === true && typeof config.envId === "string" && config.envId.length > 0,
    envId: typeof config?.envId === "string" ? config.envId : "",
    scriptUrl: typeof config?.scriptUrl === "string" ? config.scriptUrl : "",
    integrity: typeof config?.integrity === "string" ? config.integrity : "",
  };
}

function loadTwikooScript(config) {
  if (typeof window !== "undefined" && window.twikoo) {
    return Promise.resolve(window.twikoo);
  }

  if (!config.scriptUrl) {
    return Promise.reject(new Error("Twikoo script URL is not configured"));
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    const script = existing || document.createElement("script");

    script.addEventListener("load", () => {
      if (window.twikoo) {
        resolve(window.twikoo);
      } else {
        reject(new Error("Twikoo script loaded without exposing window.twikoo"));
      }
    });
    script.addEventListener("error", () => reject(new Error("Twikoo script failed to load")));

    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = config.scriptUrl;
      script.async = true;
      if (config.integrity) {
        script.integrity = config.integrity;
        script.crossOrigin = "anonymous";
      }
      document.head.appendChild(script);
    }
  });
}

function CommentsFallback({ children }) {
  return <p className="shou-comments__fallback">{children}</p>;
}

export default function DocComments({ commentId, disabled = false }) {
  const { siteConfig } = useDocusaurusContext();
  const config = getTwikooConfig(siteConfig);
  const pageKey = typeof commentId === "string" ? commentId.trim() : "";
  const active = !disabled && config.enabled && Boolean(pageKey);
  const mountRef = useRef(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [status, setStatus] = useState("idle");
  const [retryKey, setRetryKey] = useState(0);

  // 评论区通常在正文之后，进入视口附近再加载脚本和评论。
  useEffect(() => {
    if (!active || nearViewport || !mountRef.current) {
      return undefined;
    }

    if (typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(mountRef.current);
    return () => observer.disconnect();
  }, [active, nearViewport]);

  useEffect(() => {
    if (!active || !nearViewport || !mountRef.current) {
      return undefined;
    }

    let disposed = false;
    let container = null;
    setStatus("loading");

    loadTwikooScript(config)
      .then((twikoo) => {
        if (disposed || !mountRef.current) {
          return null;
        }

        mountRef.current.replaceChildren();
        container = document.createElement("div");
        container.className = "shou-comments__widget";
        mountRef.current.appendChild(container);

        return twikoo.init({
          envId: config.envId,
          el: container,
          // 用固定的 comment_id 作为页面标识，改标题、改 slug、移动文件都不影响已有评论。
          path: pageKey,
          lang: "zh-CN",
        });
      })
      .then(() => {
        if (!disposed) {
          setStatus("ready");
        }
      })
      .catch((error) => {
        if (!disposed) {
          console.error("Failed to load Twikoo comments", error);
          setStatus("error");
        }
      });

    return () => {
      disposed = true;
      mountRef.current?.replaceChildren();
    };
    // config 每次渲染都是新对象，这里只依赖真正影响加载的字段。
  }, [active, nearViewport, retryKey, config.envId, config.scriptUrl, config.integrity, pageKey]);

  if (disabled) {
    return null;
  }

  return (
    <section className="shou-comments" aria-labelledby="shou-comments-title">
      <div className="shou-comments__header">
        <h2 id="shou-comments-title">评论区</h2>
        <p>欢迎留下补充、纠错或使用体验；评论需要审核后显示，不需要登录。</p>
      </div>

      {!config.enabled ? (
        <CommentsFallback>
          当前环境尚未连接评论服务。需要反馈时，请前往<a href="/about/">联系项目</a>。
        </CommentsFallback>
      ) : null}

      <noscript>
        <CommentsFallback>
          评论区需要启用 JavaScript；需要反馈时，请前往<a href="/about/">联系项目</a>。
        </CommentsFallback>
      </noscript>

      {config.enabled ? <div ref={mountRef} className="shou-comments__mount" /> : null}

      {status === "loading" ? <p className="shou-comments__status">正在加载评论区……</p> : null}
      {status === "error" ? (
        <div className="shou-comments__error" role="alert">
          <p>评论服务暂时不可用，正文阅读不受影响。</p>
          <button type="button" onClick={() => setRetryKey((key) => key + 1)}>
            重试
          </button>
          <a href="/about/">联系项目</a>
        </div>
      ) : null}
    </section>
  );
}

import React, { useEffect, useRef, useState } from "react";

import { useColorMode } from "@docusaurus/theme-common";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import "artalk/Artalk.css";

function getArtalkConfig(siteConfig) {
  const config = siteConfig.customFields?.artalk;

  return {
    enabled: config?.enabled === true && typeof config.server === "string" && config.server.length > 0,
    server: typeof config?.server === "string" ? config.server : "",
    site: typeof config?.site === "string" && config.site.length > 0 ? config.site : "水专手册",
  };
}

function CommentsFallback({ children }) {
  return <p className="shou-comments__fallback">{children}</p>;
}

export default function DocComments({ commentId, pageTitle, disabled = false }) {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();
  const mountRef = useRef(null);
  const instanceRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [retryKey, setRetryKey] = useState(0);
  const config = getArtalkConfig(siteConfig);
  const pageKey = typeof commentId === "string" ? commentId.trim() : "";

  useEffect(() => {
    if (disabled || !config.enabled || !pageKey || !mountRef.current) {
      return undefined;
    }

    let disposed = false;
    let instance;
    const onListLoaded = () => setStatus("ready");
    const onListFailed = () => setStatus("error");

    setStatus("loading");

    import("artalk")
      .then(({ default: Artalk }) => {
        if (disposed || !mountRef.current) {
          return;
        }

        instance = Artalk.init({
          el: mountRef.current,
          pageKey,
          pageTitle,
          server: config.server,
          site: config.site,
          locale: "zh-CN",
          darkMode: colorMode === "dark",
          preferRemoteConf: false,
          imgUpload: false,
          preview: false,
          emoticons: false,
          vote: false,
          pageVote: false,
          uaBadge: false,
          reqTimeout: 10,
        });

        instanceRef.current = instance;
        instance.on("list-loaded", onListLoaded);
        instance.on("list-failed", onListFailed);
      })
      .catch((error) => {
        if (!disposed) {
          console.error("Failed to load Artalk comments", error);
          setStatus("error");
        }
      });

    return () => {
      disposed = true;
      if (instance) {
        instance.off("list-loaded", onListLoaded);
        instance.off("list-failed", onListFailed);
        instance.destroy();
      }
      if (instanceRef.current === instance) {
        instanceRef.current = null;
      }
      mountRef.current?.replaceChildren();
    };
  }, [colorMode, config.enabled, config.server, config.site, disabled, pageKey, pageTitle, retryKey]);

  if (disabled) {
    return null;
  }

  return (
    <section className="shou-comments" aria-labelledby="shou-comments-title">
      <div className="shou-comments__header">
        <h2 id="shou-comments-title">评论区</h2>
        <p>欢迎留下补充、纠错或使用体验；评论可能需要审核后显示。</p>
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

      {config.enabled ? <div ref={mountRef} className="shou-comments__widget" /> : null}

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

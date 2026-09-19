import React, { useEffect, useRef, useState } from "react";

import { useColorMode } from "@docusaurus/theme-common";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import "artalk/Artalk.css";

// 模块级缓存：同一页面内多个评论区实例只下载一次 Artalk。
let artalkModulePromise = null;

function loadArtalkModule() {
  if (!artalkModulePromise) {
    artalkModulePromise = import("artalk")
      .then((module) => module.default)
      .catch((error) => {
        artalkModulePromise = null;
        throw error;
      });
  }

  return artalkModulePromise;
}

// 页面空闲时预取脚本，避免和首屏关键资源抢带宽；失败留给初始化阶段处理。
function prefetchArtalkModule() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const start = () => {
    loadArtalkModule().catch(() => {});
  };

  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(start, { timeout: 4000 });
    return () => window.cancelIdleCallback(handle);
  }

  const handle = window.setTimeout(start, 1500);
  return () => window.clearTimeout(handle);
}

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
  const colorModeRef = useRef(colorMode);
  const [nearViewport, setNearViewport] = useState(false);
  const [status, setStatus] = useState("idle");
  const [retryKey, setRetryKey] = useState(0);
  const config = getArtalkConfig(siteConfig);
  const pageKey = typeof commentId === "string" ? commentId.trim() : "";
  const active = !disabled && config.enabled && Boolean(pageKey);

  colorModeRef.current = colorMode;

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    return prefetchArtalkModule();
  }, [active]);

  // 评论区通常在正文之后，接近视口时再初始化，避免正文还在加载时抢占带宽。
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
      { rootMargin: "300px 0px" },
    );

    observer.observe(mountRef.current);
    return () => observer.disconnect();
  }, [active, nearViewport]);

  // 初始化只依赖页面标识与构建期配置。主题切换通过 setDarkMode 处理，不重建实例，
  // 否则异步 import 与主题变化交错时会挂载出第二个评论区。
  useEffect(() => {
    if (!active || !nearViewport || !mountRef.current) {
      return undefined;
    }

    const mount = mountRef.current;
    let disposed = false;

    setStatus("loading");

    loadArtalkModule()
      .then((Artalk) => {
        if (disposed || !mountRef.current) {
          return;
        }

        // 初始化前先清空容器并销毁旧实例，保证页面上始终只有一个评论区。
        instanceRef.current?.destroy();
        instanceRef.current = null;
        mount.replaceChildren();

        instanceRef.current = Artalk.init({
          el: mount,
          pageKey,
          pageTitle,
          server: config.server,
          site: config.site,
          locale: "zh-CN",
          darkMode: colorModeRef.current === "dark",
          preferRemoteConf: false,
          imgUpload: false,
          preview: false,
          emoticons: false,
          vote: false,
          pageVote: false,
          uaBadge: false,
          reqTimeout: 10,
        });

        // 组件已经挂载，后续的列表与错误提示由 Artalk 自己渲染。
        setStatus("ready");
      })
      .catch((error) => {
        if (!disposed) {
          console.error("Failed to load Artalk comments", error);
          setStatus("error");
        }
      });

    return () => {
      disposed = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
      mount.replaceChildren();
    };
  }, [active, nearViewport, retryKey, config.server, config.site, pageKey, pageTitle]);

  // 主题变化只通知已有实例，不重新初始化。
  useEffect(() => {
    instanceRef.current?.setDarkMode(colorMode === "dark");
  }, [colorMode, status]);

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

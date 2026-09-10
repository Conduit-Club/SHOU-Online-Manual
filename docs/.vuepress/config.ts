import { defaultTheme } from "@vuepress/theme-default";
import { pwaPlugin } from "@vuepress/plugin-pwa";
import { tocPlugin } from "@vuepress/plugin-toc";
import { prismjsPlugin } from "@vuepress/plugin-prismjs";
import { defineUserConfig } from "@vuepress/cli";
import { viteBundler } from "@vuepress/bundler-vite";

const title = "水专手册";
const description = "上海海洋大学校园信息手册";
const color = "#D17D8A";

export default defineUserConfig({
  bundler: viteBundler(),
  shouldPrefetch: false,
  locales: {
    "/": {
      title,
      lang: "zh-CN",
      description,
    },
  },
  head: [
    ["meta", { name: "theme-color", content: color }],
    ["link", { rel: "manifest", href: "/manifest.webmanifest" }],
  ],
  plugins: [pwaPlugin(), tocPlugin(), prismjsPlugin({ themes: { light: "one-light", dark: "one-dark" } })],
  theme: defaultTheme({
    navbar: [
      { text: "主页", link: "/" },
      { text: "关于", link: "/about/" },
      { text: "站点帮助", link: "/site-help/" },
    ],
    repo: "Conduit-Club/SHOU-Online-Manual",
    repoLabel: "在 GitHub 上查看",
    docsRepo: "Conduit-Club/SHOU-Online-Manual",
    docsDir: "docs",
    editLinkText: "一起完善这本手册！",
    lastUpdatedText: "上次更新",
    contributorsText: "贡献者",
    editLink: true,
    docsBranch: "master",
    tip: "提示",
    warning: "注意",
    danger: "警告",
    notFound: ["这里什么都没有", "这是一个 404 页面", "看起来我们进入了错误的链接"],
    backToHome: "返回首页",
    openInNewWindow: "在新窗口打开",
    toggleColorMode: "切换夜间模式",
    toggleSidebar: "切换侧边栏",
    sidebarDepth: 2,
    sidebar: [
      "/",
      "/freshman-guide/",
      "/study/",
      {
        text: "服务与技巧",
        link: "/service/",
        children: [
          { text: "学号的意义", link: "/service/sid/" },
          { text: "校园卡与学生证", link: "/service/campus-card/" },
          { text: "校园网络", link: "/service/network/" },
          { text: "打印机", link: "/service/teaching/printer.html" },
          { text: "电子邮件", link: "/service/communication/email.html" },
          { text: "快递收发", link: "/service/packages/" },
          { text: "就医指南", link: "/service/medical/" },
          {
            text: "软件授权",
            link: "/service/software-licenses/",
            children: [
              { text: "学校已购买的软件", link: "/service/software-licenses/purchased.html" },
              { text: "教育邮箱福利", link: "/service/software-licenses/education-email.html" },
            ],
          },
          { text: "图书馆", link: "/service/library/" },
          { text: "什么值得买", link: "/service/what-to-buy/" },
          { text: "文档模板", link: "/service/document-templates.html" },
        ],
      },
      "/life/",
      "/canteen/",
      "/facilities/",
      "/facilities/campus-map.html",
      {
        text: "交通",
        link: "/transport/",
        children: [
          { text: "机场到校", link: "/transport/airports.html" },
          { text: "火车站到校", link: "/transport/railway-stations.html" },
        ],
      },
      "/surroundings/",
      "/contact/",
      "/emergency/",
      "/clubs/",
      "/media/",
      "/calendar/",
      "/site-help/contribution-template.html",
      "/site-help/",
    ],
  }),
});

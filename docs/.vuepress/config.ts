import { defaultTheme } from "@vuepress/theme-default";
import { pwaPlugin } from "@vuepress/plugin-pwa";
import { searchPlugin } from "@vuepress/plugin-search";
import { tocPlugin } from "@vuepress/plugin-toc";
import { defineUserConfig } from "@vuepress/cli";
import { viteBundler } from "@vuepress/bundler-vite";

const title = "水专手册";
const description = "上海海洋大学校园信息手册";
const color = "#49BF7C";

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
  plugins: [
    pwaPlugin(),
    tocPlugin(),
    searchPlugin({
      locales: {
        "/": {
          placeholder: "搜索手册",
        },
      },
    }),
  ],
  theme: defaultTheme({
    navbar: [
      { text: "🏠主页", link: "/" },
      { text: "ℹ️关于", link: "/about/" },
      { text: "🛠️站点帮助", link: "/site-help/" },
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
      { text: "🏠水专手册", link: "/" },
      { text: "📚新生指南", link: "/freshman-guide/" },
      {
        text: "🎓学习与发展",
        link: "/study/",
        children: [
          { text: "课程、学分与 GPA", link: "/study/courses-and-gpa.html" },
          { text: "刷 GPA 实用网站", link: "/study/learning-sites.html" },
          { text: "发论文实用工具", link: "/study/paper-tools.html" },
        ],
      },
      {
        text: "🧰服务与技巧",
        link: "/service/",
        collapsible: true,
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
            collapsible: true,
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
      { text: "🏡校园生活", link: "/life/" },
      { text: "🍽️食堂", link: "/canteen/" },
      { text: "📍设施", link: "/facilities/" },
      { text: "🗺️校园地图", link: "/facilities/campus-map.html" },
      {
        text: "🚇交通",
        link: "/transport/",
        collapsible: true,
        children: [
          { text: "机场到校", link: "/transport/airports.html" },
          { text: "火车站到校", link: "/transport/railway-stations.html" },
        ],
      },
      { text: "🧭周边出行", link: "/surroundings/" },
      { text: "☎️黄页", link: "/contact/" },
      { text: "🚨应急", link: "/emergency/" },
      { text: "🎪社团活动", link: "/clubs/" },
      { text: "📰媒体与网站", link: "/media/" },
      { text: "📅校历", link: "/calendar/" },
      { text: "📝贡献模板", link: "/site-help/contribution-template.html" },
      { text: "❓站点帮助", link: "/site-help/" },
    ],
  }),
});

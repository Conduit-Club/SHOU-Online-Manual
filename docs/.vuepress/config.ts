import { defaultTheme } from '@vuepress/theme-default'
import { pwaPlugin } from '@vuepress/plugin-pwa'
import { tocPlugin } from '@vuepress/plugin-toc'
import { defineUserConfig } from '@vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'

const title = '水专手册'
const description = '上海海洋大学校园信息手册'
const color = '#49BF7C'

export default defineUserConfig({
    bundler: viteBundler(),
    shouldPrefetch: false,
    locales: {
        '/': {
            title,
            lang: 'zh-CN',
            description,
        },
    },
    head: [
        ['meta', { name: 'theme-color', content: color }],
        ['link', { rel: 'manifest', href: '/manifest.webmanifest' }],
    ],
    plugins: [
        pwaPlugin({
            skipWaiting: true,
            clientsClaim: true,
            cleanupOutdatedCaches: true,
        }),
        tocPlugin(),
    ],
    theme: defaultTheme({
        themePlugins: {
            git: {
                contributors: {
                    transform: (contributors) => contributors.filter(
                        ({ name }) => ['aer', 'moeary'].includes(name.toLowerCase()),
                    ),
                },
            },
        },
        navbar: [
            { text: '主页', link: '/' },
            { text: '关于', link: '/about/' },
            { text: '站点帮助', link: '/site-help/' },
        ],
        repo: 'Conduit-Club/shou-online-guide',
        repoLabel: '在 GitHub 上查看',
        docsRepo: 'Conduit-Club/shou-online-guide',
        docsDir: 'docs',
        editLinkText: '一起完善这本手册！',
        lastUpdatedText: '上次更新',
        contributorsText: '贡献者',
        editLink: true,
        docsBranch: 'master',
        tip: '提示',
        warning: '注意',
        danger: '警告',
        notFound: ['这里什么都没有', '这是一个 404 页面', '看起来我们进入了错误的链接'],
        backToHome: '返回首页',
        openInNewWindow: '在新窗口打开',
        toggleColorMode: '切换夜间模式',
        toggleSidebar: '切换侧边栏',
        sidebarDepth: 2,
        sidebar: [
            '/',
            '/if-you-are-a-freshman/',
            '/study/',
            '/service/',
            '/service/official-entrances.html',
            '/life/',
            '/canteen/',
            '/facility/',
            '/transport/',
            '/surroundings/',
            '/contact/',
            '/emergency/',
            '/organizations/',
            '/media/',
            '/calendar/',
            '/site-help/contribution-template.html',
            '/site-help/',
        ],
    }),
})

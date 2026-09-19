# 水专手册 / SHOU Online Manual

本手册是一个面向上海海洋大学学生、教师与校友的校园生活手册，提供可靠、易查找的校内信息入口。

本项目由南科手册改编而来，目前正处于内容迁移与重建阶段，使用 Docusaurus 生成静态文档站。通用经验会保留，涉及学校制度、地址、系统、联系方式和时间表的内容必须重新核验后才能发布。

## 当前维护者

- [Aer](https://github.com/LagrangeWithLight)
- [Moeary](https://github.com/Moeary)
- [Aaron Ruan](https://github.com/Aaron-212)

## 当前状态

- Docusaurus 站点骨架和构建流程可用。
- 各栏目已建立海大版本占位页。
- 海大专属资料正在收集、核验和重写。

## 本地部署与开发

先安装 [Pixi](https://pixi.sh/latest/installation/)。项目由 Pixi 管理 Node.js 24、pnpm 12 和常用任务，无需另行全局安装 Node.js 或 pnpm。支持 Windows x64、Linux x64 和 macOS Intel / Apple Silicon。

```bash
pixi run dev                 # 安装锁定依赖并启动 Docusaurus 开发服务器
pixi run --locked build      # 安装锁定依赖并构建静态站点
pixi run --locked start      # 构建后在 http://localhost:4173 预览产物
pixi run --locked fmt-check  # 检查受管文件的格式
```

首次运行会自动创建 `.pixi` 环境并安装依赖。构建产物位于 `build/`，可部署到 Vercel 或其他静态文件托管服务。需要指定规范站点 URL 时设置 `SITE_URL`，需要子路径部署时设置 `BASE_URL`。

### 评论区配置

文档默认带有评论区，并通过 front matter 中固定的 `comment_id` 绑定 Artalk 页面；移动或改名时请保留这个值，复制新文档时再生成新的值。`comments: false` 可以关闭单篇文档的评论区。

本地和 Preview 默认不连接评论服务。生产构建需要设置以下公开配置：

```text
ARTALK_ENABLED=true
ARTALK_SERVER_URL=https://manual.moear.de
ARTALK_SITE=水专手册
```

生产环境推荐把 Artalk API 挂在手册同源地址：`ARTALK_SERVER_URL=https://manual.moear.de`。Artalk 前端随后会请求 `https://manual.moear.de/api/v2/*`，浏览器可以复用手册页面已有的连接，避免再建立 `comments.moear.de` 的 DNS、TCP 和 TLS 路径。服务器的 `manual.moear.de` HTTPS server block 需要加入 [`script/artalk/nginx-manual-api.conf`](./script/artalk/nginx-manual-api.conf)；该片段保留 `/api/v2/` 路径，`proxy_pass` 末尾不要加 `/`。`comments.moear.de` 可以继续保留为 Artalk 管理和调试入口。

如果手册 Nginx 运行在 Docker 中，需要让它与 Artalk 加入同一个 Docker network，并使用 `http://artalk:23366`；宿主机直接运行 Nginx 时可改为 `http://127.0.0.1:23366`。Artalk 的 `trusted_domains` 仍应允许 `https://manual.moear.de` 以及需要使用评论的 Preview 域名。Artalk 后端部署模板位于 [`script/artalk`](./script/artalk)。服务器上的 `data/` 目录包含评论数据库，必须持久化并纳入备份，不要提交到仓库。

服务器部署工作流从 GitHub Actions Secrets 读取 `SITE_URL`、`ARTALK_SERVER_URL`、`ARTALK_SITE` 和 `ARTALK_ENABLED`；这些值不会写入仓库，但构建出的静态站点仍会公开使用它们。

如果你想贡献自己的一份力,建议先阅读 [AGENTS.md](./AGENTS.md) 了解开发流程和验证要求。

## 参与贡献

欢迎通过 Issue 或 Pull Request 提供内容。涉及电话、地址、流程、价格、时间表和链接的内容，请附官方来源及核验日期；经验分享请注明适用学年。

## 上游来源与许可证

本项目基于 [南科手册 / SUSTech-CRA/sustech-online-ng](https://github.com/SUSTech-CRA/sustech-online-ng) 的结构与内容改编。上游贡献者署名记录可在其[提交历史](https://github.com/SUSTech-CRA/sustech-online-ng/commits/master/)中查阅。新仓库历史从导入快照开始，随后保留 Aer 的海大改编提交；导入记录不代表对上游原创内容的作者认领。

本项目的文档内容默认以 [知识共享署名-相同方式共享 4.0 国际许可协议（CC BY-SA 4.0）](https://creativecommons.org/licenses/by-sa/4.0/) 发布，完整协议文本见 [`LICENSE`](./LICENSE)。

使用或改编上游内容时，须保留原作者和来源说明，并以相同许可协议分享改编内容。图片、PDF、代码和其他第三方材料如有单独许可或版权声明，以其声明为准，不因收录于本仓库而自动适用 CC BY-SA 4.0。

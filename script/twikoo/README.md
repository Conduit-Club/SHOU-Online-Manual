# Twikoo on Netlify 接入说明

本文说明「水专手册」评论区的 Twikoo 方案，对应 Issue [#55](https://github.com/Conduit-Club/SHOU-Online-Manual/issues/55)。它是 [PR #57](https://github.com/Conduit-Club/SHOU-Online-Manual/pull/57) 提出的 Artalk 方案之外的备选路线，两份方案互不影响，可以只选一份落地。

本文记录设计取舍、部署步骤和未完成事项，不代表已经完成部署。截至 2026-09-19，仓库里只有前端接入代码，Netlify 站点和 MongoDB 数据库尚未创建。

## 为什么考虑 Twikoo

Issue #55 的核心需求是「没有 GitHub 账号的同学也能发言」。Artalk 和 Twikoo 都满足这一点，差别在维护成本和访客体验：

- Twikoo 的后端可以放在 Serverless 平台上，不需要一台长期在线的服务器。
- 昵称栏填 QQ 号时会自动补全昵称和头像，对非技术用户几乎零门槛。
- 评论通知可以走 QQ 或微信，比纯邮件更贴合国内使用习惯。
- 支持从 Artalk 导入评论，因此「先用 Artalk 上线、以后换 Twikoo」这条路径是通的。

站点本身继续部署在 Vercel；Netlify 只承载评论后端，两者相互独立。评论服务中断时正文仍可正常阅读。

## 架构

```text
访客浏览器
  ├─ 页面：Vercel 上的 Docusaurus 静态站点
  └─ 评论区：加载 Twikoo 前端脚本
              └─ 请求 Netlify Function（/.netlify/functions/twikoo）
                    └─ 读写 MongoDB Atlas 中的评论数据
```

前端脚本在当前实现中从 npm 镜像加载，而不是打包进站点：

```text
https://registry.npmmirror.com/twikoo/1.7.24/files/dist/twikoo.min.js
```

选用 npm 镜像而不是 jsDelivr，是因为 jsDelivr 在中国大陆的可用性不稳定。脚本地址锁定版本并带 SRI 校验，可以用 `TWIKOO_SCRIPT_URL` 和 `TWIKOO_SCRIPT_INTEGRITY` 覆盖。如果镜像本身也不可靠，可以改为把脚本放进 `static/` 自托管，此时要一并记录版本与 MIT 许可来源。

## 部署步骤

以下步骤来自 Twikoo 官方文档的 Netlify 部署一节，尚未在本项目执行。

1. 申请 [MongoDB Atlas](https://www.mongodb.com/atlas) 账号，创建免费档 M0 集群，取得连接字符串。
2. 申请并登录 [Netlify](https://app.netlify.com) 账号，创建一个 Team。
3. Fork [twikoojs/twikoo-netlify](https://github.com/twikoojs/twikoo-netlify)。注意不要 fork 成 `twikoojs/twikoo`，后者不是 Netlify 部署模板，部署后会 404。
4. 在 Netlify 点击 Add new site，选择 Import an existing project，选中刚 fork 的仓库。
5. 添加环境变量 `MONGODB_URI`，值为第 1 步的连接字符串，然后部署。
6. 部署完成后在 Domain settings 里设置三级域名，例如 `shou-comments.netlify.app`。
7. 打开站点首页，如果配置正确会看到「Twikoo 云函数运行正常」。
8. 环境 ID 是完整地址，必须带后缀：`https://<站点名>.netlify.app/.netlify/functions/twikoo`。

审核者在评论窗口点击齿轮图标设置管理员密码，即可进入管理面板；非腾讯云环境不需要私钥文件。

## 站点侧接入

本分支已经完成的部分：

- `src/components/DocComments.jsx`：评论区组件。接近视口时才加载脚本，初始化失败时显示重试入口，禁用 JavaScript 时保留提示与「联系项目」入口。
- `src/theme/DocItem/Layout/index.js`：在正文与文档页脚之后统一注入评论区，不需要在每个 Markdown 文件里手工添加。
- `docs/**/*.md`：每篇文档的 front matter 增加 `comment_id`。
- `src/css/custom.css`：评论区容器样式与深色模式下的基础覆盖。
- `docusaurus.config.js`：从构建环境读取 `TWIKOO_ENABLED` 与 `TWIKOO_ENV_ID`。

页面标识使用 front matter 中的 `comment_id`，而不是标题或 URL。这样改标题、改 `slug`、移动文件时，已有评论仍然能对上；复制成新文档时要生成新的 `comment_id`，拆分或合并文档时要明确评论归属。

## 审核与反垃圾

按 Issue #55 讨论确定的方向，评论采用先审后发，由项目组成员审核。审核者在 GitHub Organization 中的 Team Manual 与 Team Manual (Review-Only) 范围内，可以在 Twikoo 管理面板里处理待审评论。

Twikoo 支持的反垃圾手段，按投入从低到高：

- 人工审核模式：全部评论先进入待审队列。
- Akismet：免费，注册后把 API Key 填进管理面板的「反垃圾」模块。它采用先放行后检测的策略，垃圾评论可能短暂可见。
- 腾讯云文本内容检测：付费，约 25 元每万条，可配置自定义词库。
- 大模型反垃圾：支持任意 OpenAI 兼容接口，可以填 DeepSeek 等服务的密钥。
- IP 限流：服务端 `TWIKOO_THROTTLE`，默认阈值 250。

首期建议只开人工审核，配合 Akismet 即可覆盖校园手册的访问量；如果垃圾评论明显增多，再考虑内容安全服务或大模型检测。

## 免费额度

- Netlify Functions Level 0：每月 12.5 万次调用，100 小时计算时长。
- MongoDB Atlas M0：512 MB 存储，共享集群。

按校园手册的访问量估算，正常使用远低于这两个上限。需要注意 Netlify 的免费额度按 Team 计算，如果同账号下还有其它站点要一并考虑。

## 风险与待验证

以下问题在合并前需要实测，本轮没有条件验证：

- 中国大陆可达性。Twikoo 官方文档给 Netlify 四星评价，并写明「中国大陆访问速度不错」，但 `netlify.app` 的历史可用性并不稳定，社区有通过 CNAME 优选加速的做法。建议先用 `*.netlify.app` 验证，确认可用后再决定是否绑定自有域名。
- MongoDB Atlas 在中国大陆的连接质量。Atlas 托管在境外云上，延迟和稳定性需要实测。
- 深色模式。Twikoo 自带浅色样式，本分支只覆盖了输入框和按钮等大面积色块，实际观感需要连接真实评论服务后人工复查。
- 版本更新。Netlify 版需要手动修改 fork 仓库里 `package.json` 的 `twikoo-netlify` 版本号，可以加 GitHub Actions 定时任务自动跟版，但自动跟随最新版有兼容风险。
- 图片上传。Netlify 环境没有自带图床，如果以后要开放图片，需要额外配置图床或对象存储。首期不开放附件上传。

## 验收清单

- 没有 GitHub 账号的访客可以提交评论。
- 评论经审核后才公开显示。
- 页面改名或移动后，原评论仍然可见，不同页面之间不串评论。
- Preview 与本地构建不写入生产评论数据。
- 移动端与深色模式显示正常。
- 评论服务中断时正文阅读不受影响，并能看到重试入口。
- `pixi run --locked build`、`fmt-check`、`lint` 均通过。

## 与 Artalk 方案的关系

[PR #57](https://github.com/Conduit-Club/SHOU-Online-Manual/pull/57) 的 Artalk 方案不改动，本分支是独立备选。

两份方案共用的部分与引擎无关：`comment_id` 页面标识、`src/theme/DocItem/Layout/index.js` 的注入点、加载失败降级与重试、审核与先审后发流程。

只有前端组件与构建配置需要替换。如果先上 Artalk、以后迁到 Twikoo，改动量集中在 `DocComments.jsx` 和 `docusaurus.config.js`，评论数据可以用 Twikoo 管理面板的导入功能从 Artalk 迁移。

## 未决事项

- 评论后端是否绑定自有域名，由 Moeary 决定是否使用 `*.moeary.de`。
- 审核负责人和响应时限尚未指定。
- 是否开放图片上传，首期倾向于不开放。

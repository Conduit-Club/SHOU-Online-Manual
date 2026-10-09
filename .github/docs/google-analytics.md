# Google Analytics 4 运维说明

VPS 部署支持 Google Analytics 4。在 GitHub 仓库的 Settings → Secrets and variables → Actions 中添加 Repository secret `GA_MEASUREMENT_ID`，值为网站数据流的 `G-...` 衡量 ID。服务器部署工作流会在构建时读取该值，把统计代码写入静态产物；之后每次部署自动携带，无需在 VPS 配置运行时变量。

未提供 ID 时不启用统计；开发服务器也不会发送统计。PR 检查和 Vercel Preview 默认不读取此 Secret。衡量 ID 会出现在浏览器可读的产物中，不是访问凭证。

Docusaurus 的 gtag 插件会主动发送站内切页的 `page_view`。在 GA4 的“管理 → 数据流 → 网站数据流 → 增强型衡量 → 网页浏览量 → 高级设置”中，关闭“根据浏览器历史记录事件发生的网页更改”，保留页面加载统计，避免重复计数。插件也会记录 URL 查询参数或锚点的变化，查看次数不等于独立访客人数。

部署后用 Tag Assistant / DebugView 检查首次打开和站内切页各发送一次 `page_view`。在“报告 → 互动 → 网页和屏幕”中选择“网页路径和屏幕类”，按“查看次数”降序查看热门页面；该报告未显示时，可由编辑者从报告库添加。统计由访客浏览器发送，网络连接失败或拦截脚本会导致漏记。

参考：[Docusaurus gtag 配置](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-google-gtag)、[GA4 增强型衡量](https://support.google.com/analytics/answer/9216061?hl=zh-Hans)、[网页和屏幕报告](https://support.google.com/analytics/answer/12926732?hl=zh-Hans)（核验日期：2026-10-09）。

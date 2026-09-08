# 水专手册 / SHOU Online Manual

面向上海海洋大学学生、教师与校友的校园生活手册，提供可靠、易查找的校内信息入口。

本项目由南科手册改编而来，目前正处于内容迁移与重建阶段。通用经验会保留，涉及学校制度、地址、系统、联系方式和时间表的内容必须重新核验后才能发布。

## 当前维护者

- Aer
- [Moeary](https://github.com/Moeary)
- [Aaron Ruan](https://github.com/Aaron-212)

## 当前状态

- VuePress 站点骨架和构建流程可用。
- 各栏目已建立海大版本占位页。
- 海大专属资料正在收集、核验和重写。

## 本地开发

先安装 [Pixi](https://pixi.sh/latest/installation/)。项目由 Pixi 管理 Node.js 24、pnpm 12 和常用任务，无需另行全局安装 Node.js 或 pnpm。支持 Windows x64、Linux x64 和 macOS Intel / Apple Silicon。

```bash
pixi run dev                 # 安装锁定依赖并启动开发服务器，支持热更新
pixi run --locked build      # 安装锁定依赖并构建静态站点
pixi run start               # 构建后在 http://localhost:8080 预览产物
```

首次运行会自动创建 `.pixi` 环境并安装依赖。构建产物位于 `docs/.vuepress/dist/`。传参示例：`pixi run dev --host 0.0.0.0`。代码格式检查使用 `pixi run --locked fmt-check`。

`pixi.lock` 锁定工具环境，`pnpm-lock.yaml` 锁定 JavaScript 依赖，两者都须纳入版本控制。仅安装依赖可运行 `pixi run install`；新增前端依赖使用 `pixi run pnpm add <package>`，更新后提交对应清单与锁文件。

### Windows Shell

需要 Bash 时使用标准 Git Bash（例如 `D:\Programs_Dev\Git\usr\bin\bash.exe`），不要使用 w64devkit。PowerShell 7 和 Git Bash 都应从仓库根目录直接运行上面的 `pixi` 命令，并保留现有全局 `PIXI_HOME` 配置；本仓库不提供会改写 `HOME`、`PIXI_HOME` 或路径的包装脚本。

## 分支与部署

- `dev`：日常开发与 Vercel 预览。
- `master`：正式发布，Vercel Production Branch 设为 `master`。
- 所有 feature 分支必须先通过 Pull Request 合并到 `dev`，并在 `dev` 完成构建验证；禁止 feature 分支直接提交、推送或合并到 `master`。
- 首次使用 `dev` 部署以检查效果；确认后只能通过 `dev` 到 `master` 的 Pull Request 发布。

GitHub Actions 使用 `pixi run --locked build` 验证构建并保存产物。网站由 Vercel 的 Git 集成自动部署，不再通过工作流发布 GitHub Pages。

在 Vercel 导入 `Conduit-Club/shou-online-guide`，Framework Preset 选择 **Other**，根目录为仓库根目录。`vercel.json` 已配置：

| 配置                | 值                                         |
| ------------------- | ------------------------------------------ |
| Install Command     | `bash scripts/vercel-install.sh`           |
| Build Command       | `.vercel/pixi/bin/pixi run --locked build` |
| Output Directory    | `docs/.vuepress/dist`                      |
| Development Command | `pixi run dev`                             |

安装脚本从 Pixi 官方来源安装与 CI 相同的版本，再通过锁文件安装依赖。Vercel 的 Production Branch 在项目的 Environments → Production 中设置为 `master`；首次可选择 `dev` 部署，随后切回 `master`。

## 参与贡献

欢迎通过 Issue 或 Pull Request 提供内容。涉及电话、地址、流程、价格、时间表和链接的内容，请附官方来源及核验日期；经验分享请注明适用学年。

## 上游来源与许可证

本项目基于 [南科手册 / SUSTech-CRA/sustech-online-ng](https://github.com/SUSTech-CRA/sustech-online-ng) 的结构与内容改编。上游贡献者署名记录可在其[提交历史](https://github.com/SUSTech-CRA/sustech-online-ng/commits/master/)中查阅。新仓库历史从导入快照开始，随后保留 Aer 的海大改编提交；导入记录不代表对上游原创内容的作者认领。

本项目的文档内容默认以 [知识共享署名-相同方式共享 4.0 国际许可协议（CC BY-SA 4.0）](https://creativecommons.org/licenses/by-sa/4.0/) 发布，完整协议文本见 [`LICENSE`](./LICENSE)。

使用或改编上游内容时，须保留原作者和来源说明，并以相同许可协议分享改编内容。图片、PDF、代码和其他第三方材料如有单独许可或版权声明，以其声明为准，不因收录于本仓库而自动适用 CC BY-SA 4.0。

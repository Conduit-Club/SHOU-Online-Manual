# AGENTS.md

本文件适用于本仓库的所有协作者，包括人类与 AI。若子目录存在更具体的 `AGENTS.md`，应同时遵守其补充规则。

## 分支与合并规则

- `dev` 是日常开发与集成分支；所有更新必须先进入 `dev`。
- 正常功能、修复和内容更新应从最新 `dev` 创建 feature 分支，并通过 Pull Request（或等价的评审流程）合并回 `dev`。
- feature 分支不得直接提交、推送或合并到 `master`。
- `master` 只接受已经在 `dev` 集成并验证过的发布变更，发布时使用从 `dev` 到 `master` 的 Pull Request；禁止绕过 `dev` 直接交付 `master`。
- 开始分支操作前先检查 `git status`、当前分支和远端状态；不得覆盖与任务无关的本地改动。
- 合并冲突必须逐项审阅，不能为了快速通过而静默丢弃任一分支的有效内容。
- 未经明确授权，不要改写共享分支历史，不要强制推送，也不要删除远端分支。

## 构建与格式门禁

- 任何代码、文档、配置、依赖或其他项目文件的更新，在提交或请求合并到 `dev` 前都必须完成构建验证。
- 本项目的标准构建命令是：

  ```bash
  pixi run --locked build
  ```

  该命令执行 `pixi.toml` 中的 `build` 任务；本规则中所说的“通过 pixi build”指通过上述标准命令。
- 只有构建命令成功退出，才可以提交变更或创建/更新合并请求。构建失败时必须先修复，不能以绕过构建、直接使用裸 `pnpm` 或忽略错误的方式交付。
- 修改 TypeScript、JavaScript、Vue 或 JSON 文件后，应额外运行：

  ```bash
  pixi run --locked fmt-check
  ```

- 构建或格式检查因环境、依赖下载或其他外部原因无法完成时，必须在交付说明中如实记录；获得明确许可前，不要将变更合并到 `dev`。
- AI 不得仅凭推测声称检查通过，必须以实际命令退出状态为依据，并说明使用的命令和结果。

## 依赖、锁文件与生成物

- 修改 `package.json` 时同步检查并提交 `pnpm-lock.yaml`；修改 `pixi.toml` 时同步检查 `pixi.lock`。不要手工制造不一致的锁文件。
- 依赖安装、构建和格式检查优先通过 Pixi 任务执行，并使用 `--locked` 验证锁文件没有漂移。
- 不要提交 `node_modules/`、`.pixi/`、`docs/.vuepress/dist/`、缓存、临时文件或本机 IDE 配置；除非任务明确要求，否则不要把生成物加入版本控制。
- 依赖升级必须说明原因、影响范围和验证结果；安全或供应链相关异常必须停止交付并报告。

## 内容与代码质量

- 涉及电话、地址、流程、价格、时间表、地图和链接的内容，应优先引用学校或其他权威来源，并记录适用范围与核验日期。
- 修改公共组件、路由或导航时，同时检查链接、移动端表现、深色模式和无 JavaScript 时的降级行为。
- 保持变更最小且可回滚；无关重排、批量改名和格式化不要混入功能提交。
- 提交信息应简洁、明确地描述结果；一个提交尽量只包含一个逻辑主题。

## 跨 Shell 使用 Pixi

- Windows 上需要 Bash 时使用标准 Git Bash（例如 `D:\Programs_Dev\Git\usr\bin\bash.exe`），不要改用 w64devkit 或其他 Bash 兼容层。
- Pixi 使用现有的全局配置和 `PIXI_HOME`；如果它已指向 `D:\Programs_Dev\Pixihome`，必须保留并直接使用，不得为了仓库命令改写系统或用户环境变量。
- PowerShell 7 和 Git Bash 均从仓库根目录直接运行 `pixi run --locked build`。不要在仓库中添加会自动设置 `HOME`、`PIXI_HOME` 或重写 Windows/Unix 路径的包装脚本。
- 若 shell 未继承正确的 `HOME`、`PIXI_HOME` 或 `pixi` 路径，应报告具体环境问题；除非用户明确授权，不要通过新建目录、持久化环境变量或删除其他 Pixi 目录来绕过问题。

## 推荐工作流程

1. 开始前确认工作区、当前分支和远端状态，保留与任务无关的现有改动。
2. 从最新 `dev` 创建或更新 feature 分支并完成修改。
3. 运行 `pixi run --locked build`；涉及代码格式时再运行 `pixi run --locked fmt-check`。
4. 只在检查成功后提交，并将 feature 分支 Pull Request 合并到 `dev`。
5. 经过 `dev` 集成验证后，才由维护者通过 `dev` 到 `master` 的发布 Pull Request 发布。

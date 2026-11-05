---
id: ai-agent
slug: /study/ai-agent.html
comment_id: doc-ai-agent
---

# AI Agent 使用指南

如果你平时用大模型还停留在“打开网页、粘贴一段报错、等它回复一堆建议、再自己手动粘回编辑器”，那这篇文章会彻底改变你的开发和学习体验。

现在的 **AI Agent（智能体）** 可以直接进驻你的项目目录：它能自己阅读整个代码仓库、主动跑命令复现问题、定位报错修改源码、运行测试验证修复，最后把清晰的 Git 改动呈现给你检查。在处理专业课大作业调试、实验数据批量清洗、文献格式整理等繁琐事务时，它是一个能帮你省下大量机械劳动的强力伙伴。

本文带你从零建立认知、选定工具并配置上手：

1. **搞清概念**：用大白话讲透 LLM、Agent 和 Agent Harness 到底有什么区别。
2. **方案一：ChatGPT 官方订阅 + Codex**：开箱即用，并体验 Codex Desktop 桌面端。
3. **方案二：DeepSeek API + 接入各大 Harness**：国内直连超低成本，支持 Codex 与 Claude Code，并推荐使用 **CC Switch** 一键无痛管理多提供商。
4. **像带实习生一样指挥 AI**：实用的“人话 Prompt”与针对 `rg`（ripgrep）、PowerShell 7、Git 工作流的高阶约束模板。
5. **AI 的能力上限与边界认知**：分清它擅长什么、做不到什么，不盲信。
6. **进阶懒人操作与 Codex Computer Use 风控**：让 AI 操作电脑桌面的原理、场景与必须遵守的安全防护。
7. **必须守住的底线**：学术诚信、数据安全与 API 密钥保护。

内容来自 [Issue #90](https://github.com/Conduit-Club/SHOU-Online-Manual/issues/90)。

:::tip[核验时间]
最近核验：**2026-10-24**。AI 工具与模型迭代频繁，模型版本、计费标准、客户端安装命令请以文内各官方文档链接为准。
:::

---

## 一、先分清三个概念：LLM、Agent 与 Harness

很多人常把这三个词混为一谈，其实它们处于完全不同的层级：

```text
┌─────────────────────────────────────────────────────────────┐
│                    Agent Harness（工作台 / 宿主程序）        │
│   负责权限审批、文件读写调度、终端执行、上下文管理、读取 AGENTS.md │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                 Agent（智能体循环）                  │   │
│   │   “制定计划 → 挑选工具 → 执行操作 → 观察结果 → 迭代”  │   │
│   │                                                     │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │             LLM（大语言模型 / 大脑）          │   │   │
│   │   │       负责理解意图、推理逻辑、生成文本与指令     │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1. LLM（大语言模型）：只有大脑，没有手脚

- **代表选手**：GPT 系列、Claude 系列、DeepSeek 系列等。
- **它是怎么运作的**：LLM 是用海量文本训练出来的模型底座。你输入一段提示词（Prompt），它预测并输出最符合预期的下一段文字。
- **它的局限**：纯粹的 LLM 既看不到你电脑里的本地文件，也无法运行任何编译命令。你在聊天网页里跟它对话，本质上所有资料都要靠你人工当“搬运工”复制粘贴。

### 2. Agent（智能体）：给大脑装上了手脚和眼睛

- **核心机制**：在 LLM 外层封装了一个**自主循环（Thought → Action → Observation）**。
- **它是怎么运作的**：
  1. **思考（Thought）**：根据你的任务目标，判断第一步需要做什么。
  2. **行动（Action）**：决定调用什么工具，例如执行 `git status`、读取 `src/index.js`、或者调用搜索引擎。
  3. **观察（Observation）**：拿到工具运行的真实输出（比如终端返回的报错 Traceback），将其重新喂给大脑。
  4. **反复迭代**：根据反馈继续下一步，直到任务完成。
- **它和聊天的区别**：普通聊天面对报错只能凭经验瞎猜；Agent 却会自己去翻报错关联的文件、复现报错、修改代码并再次运行，直到报错彻底消失。

### 3. Agent Harness（工作台 / 挽具）：约束 Agent 安全干活的外壳

- **原意比喻**：“Harness”原指套在马身上的马鞍和挽具。如果没有 Harness，Agent 拿到终端执行权就可能像脱缰的野马，甚至执行不可逆的危险操作（比如误删目录）。
- **它负责什么**：
  - **工具箱供给**：给模型挂载安全的文件读写、代码搜索（Ripgrep / AST）、Bash / PowerShell 终端执行等工具。
  - **权限守门员**：拦截危险命令（如删除系统文件、推送代码等），必须弹窗让你手工敲 `Y` 批准。
  - **上下文管家**：处理长对话，在会话快撑满模型窗口时自动进行精准压缩（Compaction）。
  - **规则灌输**：在会话启动时，自动扫描并加载当前项目根目录的规则文件（如 `AGENTS.md` 或 `CLAUDE.md`）。
- **代表软件**：
  - **OpenAI Codex**：OpenAI 官方推出的本地开源代码智能体宿主，支持 CLI、VS Code 扩展和桌面端。
  - **Anthropic Claude Code**：Anthropic 官方打造的终端智能体工具，在任务规划与长链路执行上体验极佳。
  - **开源生态**：OpenCode、OpenClaw 等社区开源 Harness。

---

## 二、方案一：ChatGPT 官方订阅 + Codex（开箱即用）

如果你已经订阅了 ChatGPT 的付费会员（Plus、Pro、Team、Edu 等），这是上手最轻松、最无感的方案。

### 1. 订阅权益与计费说明

- **无需额外付费**：根据 OpenAI 官方规范，Codex 的日常使用额度**已经直接内嵌在 ChatGPT 订阅计划中**（Plus、Pro、Business、Edu 及企业版用户均可使用），你不需要为 Codex 单独购买授权。
- **多端互通**：同属于一份订阅额度，你可以在网页端、命令行工具（Codex CLI）、桌面客户端以及 VS Code / Cursor 插件中使用它。
- **网络合规**：使用该方案需在 OpenAI 支持的国家和地区进行网络访问。请务必遵守国家法律法规及校园网络安全规范。

### 2. 界面选择：GUI 永远对新手最友好

虽然很多老手喜欢在黑底白字的命令行（CLI）里敲命令，但对于绝大多数日常做作业、调代码的同学来说，**桌面客户端（Desktop GUI）往往是最直观、最省心的入口**：

- **Codex Desktop（内置于 ChatGPT 桌面端 / `codex app`）**：
  - 左侧是完整清晰的项目文件树，能直接看到 AI 动了哪几个文件；
  - 中间是自然语言交互对话区；
  - 右侧自带类似 Git 的**双栏代码对比（Diff View）**，红绿高亮显示每一行增删，改了哪里一目了然；
  - 遇到需要执行终端命令或安装依赖时，会弹出可视化的审核按钮，直接用鼠标点击“批准”或“拒绝”。
- **Claude Desktop 桌面端**：
  - 适合深度配合 Claude 的 Projects（项目管理）与 Artifacts（可视化画板）；
  - 支持开启 Developer 模式与挂载本地 MCP 服务器。

### 3. 安装与登录（CLI 命令行方式）

如果你更喜欢在终端里与代码融为一体，可以安装 Codex CLI：

在你的个人电脑上打开终端（Windows 推荐使用 PowerShell，macOS / Linux 打开 Terminal）：

- **Windows 用户（PowerShell）**：

  ```powershell
  powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"
  ```

  _如果你本地已经安装了 Node.js，也可以通过 npm 全局安装：_

  ```powershell
  npm install -g @openai/codex
  ```

- **macOS / Linux 用户**：
  ```bash
  curl -fsSL https://chatgpt.com/codex/install.sh | sh
  # 或者使用 Homebrew
  brew install --cask codex
  ```

#### 启动并完成认证

1. 进入你正在开发的代码目录：
   ```bash
   cd ~/Documents/my-project
   ```
2. 输入命令启动：
   ```bash
   codex
   # 或者启动桌面图形界面
   codex app
   ```
3. 终端会弹出一个交互菜单，选择 **Sign in with ChatGPT**。它会自动打开浏览器，完成登录确认后即可直接返回终端开始对话。

### 4. Codex 常用技巧与快捷操作

进入 Codex 的交互终端后，除了用自然语言打字，你还可以随时输入以 `/` 开头的指令来控制会话：

- **`/model`**：随时在不同模型档位之间切换（例如日常任务选轻量快速模型，复杂架构重构选深度推理模型）。
- **`/compact`**：当调试一个顽固 Bug 经历多轮交互后，上下文会变得很臃肿。敲一下 `/compact`，Codex 会在后台将前文背景压缩精简，既省额度又防止模型思维发散。
- **`/review`**：让 Codex 对当前工作区中尚未提交的代码变动进行一次全面的代码评审，主动指出潜在隐患。
- **`/permissions`**：查看和调整当前环境的文件与命令执行权限。
- **打断与恢复**：当发现 AI 走偏了或者陷入死循环时，随时按 `Ctrl + C` 即可中止当前操作；按方向键 `↑` 可以找回刚才输入的一大段要求，稍作修改重新发送。

---

## 三、方案二：DeepSeek API + 接入各大 Harness（性价比与自由度）

如果你希望按实际使用量精确扣费、享受国内网络直连的超低延迟，或者不想背负每月固定的外币订阅费，**DeepSeek API** 是目前性价比极高、体验极其出色的选择。

更棒的是：DeepSeek 开放平台在协议层面**同时原生兼容了 OpenAI Responses API 与 Anthropic API**，这意味着你可以把 DeepSeek 当作底层引擎，无缝接入到 Codex 或 Claude Code 中。

### 1. 注册与前期准备

1. **注册与开通**：访问 [DeepSeek 开放平台](https://platform.deepseek.com/)，用手机号或邮箱注册登录。
2. **余额充值**：DeepSeek 采用**预充值扣费模式**（支持国内主流支付方式）。账户余额为 0 时会自动停止服务，绝对不会产生“因忘记关掉进程而在月底收到天价账单”的隐患。新用户通常还有赠送额度。
3. **创建 API Key**：进入平台后台的 **API Keys** 页面，点击创建密钥。生成的 Key 格式一般为 `sk-xxxxxxxx`。**创建时请立即复制并妥善保存在密码管理器或本地记事本中**，关闭窗口后出于安全考虑平台不再展示完整字符串。

### 2. 模型特点与价格参考

以下为在 [DeepSeek 模型与价格官方文档](https://api-docs.deepseek.com/zh-cn/quick_start/pricing) 核验的计费标准（单位：元 / 百万 tokens）：

| 模型名称              | 推荐用途                                         | 输入（缓存命中）               | 输入（未命中）                 | 输出                             | 上下文大小 |
| :-------------------- | :----------------------------------------------- | :----------------------------- | :----------------------------- | :------------------------------- | :--------- |
| **`deepseek-flash`**  | 日常编码、单文件排错、批量脚本编写、支持图片分析 | 空闲 0.02 元<br />高峰 0.04 元 | 空闲 1.00 元<br />高峰 2.00 元 | 空闲 4.00 元<br />高峰 8.00 元   | 1M tokens  |
| **`deepseek-v4-pro`** | 复杂算法推导、大规模重构、高难度深度思考         | 空闲 0.15 元<br />高峰 0.30 元 | 空闲 4.50 元<br />高峰 9.00 元 | 空闲 13.50 元<br />高峰 27.00 元 | 1M tokens  |

- **时段省钱技巧**：北京时间周一至周五（法定工作日）9:00–12:00 与 14:00–18:00 为高峰时段；**其余所有时段（包括工作日晚间、双休日及国家法定节假日全天）均为半价优惠时段**！
- **自动上下文缓存**：代码 Agent 经常需要多次重复读取项目的骨架与文档，命中缓存的部分费用低至几乎可以忽略。
- **联网搜索注意**：内置的 Search / Fetch 网页抓取功能按每千次成功请求 5 元计费。

---

### 3. 接入实战 A：将 DeepSeek 接入 OpenAI Codex

Codex 的 CLI、VS Code 扩展和桌面端都读取同一份配置文件。你可以选择官方提供的一键脚本，也可以手动配置。

#### 方式一：官方一键配置脚本（最省心）

确保你已经安装了 Codex 并至少运行过一次（确保本地生成了 `~/.codex` 目录）。

- **Windows 用户（PowerShell）**：
  ```powershell
  irm https://cdn.deepseek.com/api-docs/codex-deepseek-setup.ps1 | iex
  ```
- **macOS / Linux 用户（终端）**：
  ```bash
  bash <(curl -fsSL https://cdn.deepseek.com/api-docs/codex-deepseek-setup.sh)
  ```

运行后会弹出菜单：

- 选 **`1`**：配置为默认使用 `deepseek-flash`（性价比首选，支持图片输入）；
- 选 **`2`**：配置为使用 `deepseek-v4-pro`；
- 选 **`9`**：**一键恢复为 Codex 默认配置**（切回 ChatGPT 官方登录）。
  首次运行脚本时，按提示把你的 `sk-` 开头的 API Key 粘贴进去即可。

#### 方式二：手动配置与双修切换（了解原理）

如果你希望保留官方配置，或者需要精细控制，可以查看 Codex 的配置目录：

- 模型元数据文件：`~/.codex/models.json`（声明 DeepSeek 模型的 1M 上下文、推理档位与图像支持）。
- 主配置文件：`~/.codex/config.toml`。

手动接入的核心配置段如下：

```toml
model = "deepseek-flash"
model_provider = "deepseek"
preferred_auth_method = "apikey"
forced_login_method = "api"
model_reasoning_effort = "high"
web_search = "disabled"
show_raw_agent_reasoning = true
model_catalog_json = "~/.codex/models.json"

[model_providers.deepseek]
name = "deepseek"
base_url = "https://api.deepseek.com/"
wire_api = "responses"
experimental_bearer_token = "sk-你的DeepSeek密钥"

[desktop]
enabled-reasoning-efforts = ["low", "medium", "high", "xhigh", "ultra", "max"]
```

:::tip[官方订阅与 API 双修常见困惑：我的历史记录丢了吗？]
很多同学在切到 DeepSeek 后打开 Codex，发现以前在 ChatGPT 登录模式下的历史会话不见了，以为被清空了。

**别慌，并没有丢！** Codex 是按认证提供方（官方 ChatGPT 账号 vs 第三方 API Key）对会话进行物理隔离的。只要用脚本选第 `9` 项切回默认，原来的会话就会完好无损地重新出现。

如果你想日常同时使用两种模式，可以在终端里利用环境变量指定不同的配置目录：

```powershell
# 临时指定一个独立配置目录启动 DeepSeek 版 Codex，不影响默认的 ChatGPT 账号环境
$env:CODEX_HOME="$HOME/.codex-deepseek"; codex
```

:::

---

### 4. 接入实战 B：将 DeepSeek 接入 Anthropic Claude Code

Claude Code 是 Anthropic 推出的终端 Agent 工具，它的交互设计极具极客风格，具有极强的自动多步探索和上下文回溯能力。由于 DeepSeek 原生提供了 Anthropic 兼容端点，我们同样可以用极低成本跑上 Claude Code。

#### 第一步：安装 Claude Code

- **通过 npm 全局安装**（跨平台通用，需已安装 Node.js 18+）：
  ```bash
  npm install -g @anthropic-ai/claude-code
  ```
- **Windows 原生安装（PowerShell）**：
  ```powershell
  irm https://claude.ai/install.ps1 | iex
  ```
  _(注：Windows 环境建议配合已安装的 [Git for Windows](https://git-scm.com/download/win)，以便 Claude Code 能获得完善的终端工具链。)_

#### 第二步：配置接入（两种姿势）

##### 姿势一：懒人 GUI 工具 CC Switch（最推荐，点点鼠标搞定）

在社区中，频繁修改环境变量让许多同学感到头疼。开源工具 **[CC Switch](https://github.com/farion1231/cc-switch)**（官网 `ccswitch.io`）专为解决多模型切换而生：

1. **下载安装**：前往 Releases 下载 Windows 安装包，或在 macOS 上使用 `brew install --cask cc-switch`。
2. **添加 DeepSeek**：打开 CC Switch，在左侧选择 Claude Code，点击添加 Provider，选择 **DeepSeek** 预设（或填入 `https://api.deepseek.com/anthropic`）。
3. **粘贴 API Key 并启用**：把 `sk-xxxx` 粘贴进去，点击“切换/启用”。
4. **原理**：CC Switch 会在后台直接将鉴权与模型映射安全地热写入配置，以后你想切回官方还是换到其他 API，点一下即可搞定，再也不用手动去改 shell 配置文件。

##### 姿势二：手动注入环境变量

如果你习惯原生纯命令行，可直接在终端中注入：

**Windows PowerShell 用户（临时生效测试）：**

```powershell
$env:ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="sk-你的DeepSeek密钥"
$env:ANTHROPIC_MODEL="deepseek-flash[1m]"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-flash[1m]"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-flash[1m]"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-flash"
$env:CLAUDE_CODE_SUBAGENT_MODEL="deepseek-flash"
$env:CLAUDE_CODE_EFFORT_LEVEL="max"
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW="786432"

# 启动
claude
```

**永久生效方法：**

- **Windows**：在 PowerShell 中执行 `notepad $PROFILE`，把上面这组 `$env:...` 粘贴保存到个人配置文件末尾，以后每次打开 PowerShell 都会自动生效。
- **macOS / Linux**：打开 `~/.bashrc` 或 `~/.zshrc`，将对应的环境变量用 `export ANTHROPIC_BASE_URL="..."` 写法追加保存，并执行 `source ~/.zshrc`。

#### 第三步：Claude Code 核心使用手感

启动 `claude` 之后，你会进入一个极具辨识度的全屏交互界面：

- **权限模式随心切（`Shift + Tab`）**：在交互输入框按 `Shift + Tab`，可以在 **Manual（每一步操作都先问你）**、**acceptEdits（自动接受文件修改，只在跑终端命令时询问）** 和 **Plan（仅规划不出手）** 之间快速切换。
- **`/init` 命令**：在一个新项目里敲 `/init`，Claude Code 会主动深度阅读整个目录结构、依赖配置和测试命令，为你自动生成一份极高质量的 `CLAUDE.md` 项目指南。
- **`/plan` 模式**：输入 `/plan 你的复杂需求`，它会进入只读思考阶段，列出周全的执行步骤和受影响模块，等你审核敲定后才开始敲击代码。
- **`/rewind`（时光倒流）**：按两次 `Esc` 键或敲 `/rewind`，你可以像撤回 Git 提交一样，将代码和对话状态一键回退到几个步骤之前的检查点。

---

## 四、实战进阶：怎样像带实习生一样指挥 AI 干活

有了强大的工具，决定产出质量的核心就在于你与 AI 的沟通方式。很多同学抱怨“AI 乱改文件”“越修 Bug 越多”，大部分是因为沟通方式还停留在“把 AI 当百宝箱”而不是“把 AI 当初级工程师”。

### 1. “人话 Prompt”的黄金四要素

不要抛出一句空泛的“帮我写个学生选课系统”。一个能让 Agent 稳定交付高质量代码的任务描述，通常包括：

| 要素         | 说明                         | 示例                                                                               |
| :----------- | :--------------------------- | :--------------------------------------------------------------------------------- |
| **明确目标** | 最终要达成的业务效果         | “修复 `src/api/auth.js` 在刷新 Token 时偶尔崩溃的问题。”                           |
| **项目背景** | 关键入口、运行环境与技术栈   | “这是基于 Node.js 20 + Express 的后端项目，认证逻辑在 `middleware/` 目录。”        |
| **明确约束** | **严禁动什么、严禁引入什么** | “不要修改数据库 Schema，不要引入新的第三方 npm 依赖，不要改动现有的公用工具函数。” |
| **验收标准** | 怎样才算真正做好了           | “运行 `pnpm test` 单元测试全部变绿，并在终端输出测试通过的日志。”                  |

---

### 2. 高阶必备：给 AI 的专项约束模板

你可以把下面这些经过大量实战验证的约束词直接存进提示词库，或直接贴在项目根目录的 `AGENTS.md` / `CLAUDE.md` 中：

#### 模板 A：高效代码检索（强制使用 `rg` / ripgrep）

_很多时候 AI 会犯傻：一次性读入几千行的大文件，或者用糟糕的递归脚本翻找，几秒钟烧完数十万 token。用这条规则约束它：_

```text
【代码检索规范】
1. 在探索代码仓库与查找函数、类、配置时，必须优先使用 ripgrep（rg）进行精准关键词或正则表达式搜索；
2. 严禁未经筛选全量读取超过 500 行的长文件；
3. 严禁执行会产生海量终端输出的命令（如无过滤的 tree、find、cat 大日志），避免污染上下文窗口。
```

#### 模板 B：Windows PowerShell 7 (`pwsh`) 严格约束

_许多同学在 Windows 下开发时，AI 经常混淆 cmd、旧版 Windows PowerShell 5.1 和新版 PowerShell 7，写出带别名或编码崩盘的脚本：_

```text
【终端环境约束（Windows pwsh 7）】
1. 当前终端环境为现代 PowerShell 7（pwsh）。严禁使用旧版 cmd.exe 或 Windows PowerShell 5.1 的专有语法；
2. 严禁使用容易产生歧义的别名（例如禁止使用 curl，必须使用真实命令或通用 node/python 脚本，因为在旧版中 curl 是 Invoke-WebRequest 别名）；
3. 命令拼接严格遵循 pwsh 规范，避免跨平台转义字符（如反引号 ` 与反斜杠 \）造成的解析失误；
4. 文件读写必须显式指定为 UTF-8 无 BOM 编码，禁止产生 GBK 乱码；
5. 换行符严格遵循仓库已有规范，严禁触发全文件 CRLF/LF 误改。
```

#### 模板 C：Git 敏捷开发与原子变更

```text
【Git 协作纪律】
1. 开始任何修改前，先运行 git status 确认当前分支与工作区状态；
2. 遵循最小修改原则：只修改与当前 Issue 强相关的文件，严禁顺带对无关文件做全局格式化或大面积重构；
3. 修改后必须执行项目测试或构建验证命令，以实际退出码为准，不得主观推测“已通过”；
4. 验证通过后使用 git diff 自查，确认无误后编写清晰的 Conventional Commits 提交信息。
```

---

## 五、AI 的能力上限与清醒认知

使用 AI Agent 最忌讳的两种极端：要么觉得它是“无所不能的银弹”，全自动撒手不管；要么试了一次跑错就全盘否定。明确其真实能力边界至关重要：

### 1. 它是无敌的“执行加速器”与“初级工程师”

- **海量样板代码编写**：根据现有代码风格快速写出完整的 CRUD、数据解析器、格式转换器。
- **定位复杂报错链条**：在几万行代码的陌生项目里顺藤摸瓜，通过堆栈定位深层报错，并提供精确的修复补丁。
- **测试用例补全**：阅读业务代码后，自动补全单元测试、模拟边界输入。

### 2. 它的能力上限在哪里？

- **没有架构洞察力与业务决断力**：它不知道你的导师或业务方真正想要什么样的产品架构。战略级的拆分、底层技术栈选型必须由人类定夺。
- **上下文衰减（Context Rotting）**：虽然上下文支持 1M 甚至更多，但在长链路任务里，交互超过一定轮次后，模型对前文细节的注意力会显著下降，甚至开始“自作主张”。必须适时使用 `/compact` 压缩或开新会话。
- **虚假自信与隐蔽 Bug**：它会写出“看起来逻辑严密、注释工整”，但在高并发、边界值或浮点精度下完全错误的代码。**没有通过自动化测试验证的 AI 代码，一律视为未完成代码**。

---

## 六、进阶：Codex Computer Use（电脑操作）与风控指南

除了在终端改代码，以 ChatGPT 桌面端内置的 **Codex Computer Use** 为代表的“屏幕操作型 Agent”正在兴起。

### 1. 什么是 Computer Use？

传统 Agent 只能读写文本和命令，而 Computer Use 让 AI 拥有了操作你整个操作系统的能力：

- **原理**：AI 定期对你的屏幕进行局部或全屏截图，结合操作系统的无障碍（Accessibility）接口识别屏幕上的每一个按钮、输入框、下拉菜单，并模拟人类的手指进行**鼠标点击、滚轮滚动、键盘键入和应用切换**。
- **典型懒人场景**：
  - **跨系统批量搬运**：学校某些老旧选课系统或实验设备软件没有对外 API，让 AI 看着屏幕把 Excel 表格逐行录入到桌面软件中。
  - **端到端 GUI 自动化验收**：让 AI 打开刚写好的前端网页或桌面客户端，模拟真实用户一步步点开弹窗、填表提交，检查界面是否有布局错位或崩溃。

### 2. 懒人操作背后的致命风险与避坑指南

开启 Computer Use 等于把键盘鼠标交给了 AI，**风险控制必须提升到最高等级**：

> [!CAUTION]
> **风险一：屏幕隐私泄露（Screen Scraping）**
> Computer Use 是通过将你的屏幕画面压缩截图上传给云端模型来识别界面的。**在启动该功能前，务必完全退出微信、QQ、网银、私人邮箱、密码管理器等包含个人隐私的软件！** 否则屏幕上的私人聊天记录和账户余额都会被截取并传给模型。

> [!WARNING]
> **风险二：误触不可逆的破坏性按钮**
> AI 在辨识复杂 UI 时可能出现漂移，误把“确认注销账号”、“清空数据”、“立即付款”当成普通操作点击。
>
> - **防护策略**：在设置中开启 **“Scoped Apps（限定应用范围）”**，强制规定 AI 只能在指定的浏览器或测试窗口内操作，禁止点击全局桌面；对高危操作保留每步人工确认。

> [!TIP]
> **风险三：死循环卡顿与 Token 极速消耗**
> 如果某个网页按钮点击后弹出了人机验证（验证码），AI 可能会陷入“没反应 → 狂点 → 截图 → 再狂点”的无限循环。几分钟内就会烧掉大量的 API 请求次数或额度。一旦发现 AI 卡在某个界面，立即按下全局热键打断。

---

## 七、学术规范与安全红线

在校园学习和学术科研中运用 AI，必须恪守底线，让技术成为助力而非学术污点。

### 1. 学术与学业红线

- **严禁直接让 AI 代写作业与论文正文**：大学各门课程、各实验环节对大模型的使用界限有明确规定。若课程要求独立完成代码或推导，使用 AI 代写属于学术不端行为。不确定边界时，**主动向任课老师或导师求证**。
- **严防“学术幻觉”**：AI 会以极其自信的口吻虚构文献作者、篡改实验数据、捏造从未存在过的 API。所有论文文献的真实性、实验数据的可复现性、事实数据（如规范标准、定理出处），**必须由你自己逐条到权威数据库中核实**。关于论文检索工具的规范使用，请查阅 [发论文实用工具](/study/paper-tools.html)。
- **自己必须具备解释权**：即使 AI 帮你优化了某段复杂算法或重构了某个模块，你也必须确保自己能逐行读懂。在课程答辩、代码评审或导师抽查中，“这是 AI 写的我不知道为什么能跑”是绝对无法被接受的回答。

### 2. 账号与个人隐私安全

- **API Key 绝对不可公开**：API Key 就等同于你的电子钱包。切记：
  - 严禁将含有 Key 的脚本或配置文件提交并推送到 GitHub 等公共平台；
  - 严禁在微信群、论坛公开发布带有 Key 的截屏；
  - 若怀疑 Key 不慎泄露，应立即登录控制台将其注销（Delete）并重新生成。
- **警惕敏感数据上传**：不要将含有本人或他人真实学号、身份证号、教务系统明文密码、未公开的实验室保密科研数据上传至外部商用大模型。

---

## 参考与核验来源

- [OpenAI Codex 官方仓库](https://github.com/openai/codex)：2026-10-24 核验 CLI 官方安装脚本、ChatGPT 订阅授权包含机制与常用命令。
- [DeepSeek 官方 API 文档 · 模型与价格](https://api-docs.deepseek.com/zh-cn/quick_start/pricing)：2026-10-24 核验当前模型命名、高峰/空闲时段计费及搜索服务规则。
- [DeepSeek 官方 API 文档 · 接入 Codex](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/codex)：2026-10-24 核验一键 PowerShell / Bash 配置脚本与 `config.toml` 配置段。
- [DeepSeek 官方 API 文档 · 接入 Claude Code](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code)：2026-10-24 核验 Anthropic 协议兼容端点、模型环境变量映射关系。
- [Anthropic Claude Code 官方文档](https://code.claude.com/docs/)：2026-10-24 核验安装命令、交互模式快捷键、权限等级与 `CLAUDE.md` / `AGENTS.md` 兼容支持。
- [CC Switch 官方仓库](https://github.com/farion1231/cc-switch)：2026-10-24 核验 Claude Code 多提供商 GUI 切换与热配置机制。

---

想查阅其他学习资源或撰写学术论文工具？欢迎回到 [刷 GPA 实用网站](/study/learning-sites.html) 与 [发论文实用工具](/study/paper-tools.html)。

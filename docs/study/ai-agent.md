---
id: ai-agent
slug: /study/ai-agent.html
comment_id: doc-ai-agent
---

# AI Agent 使用指南

聊天框里问问题只是大模型最基础的用法。现在的 AI Agent 可以直接读你的项目文件、运行命令、修改代码、整理数据，再把结果交给你检查。用好了，编程作业调试、实验数据处理、批量整理文件这类重复劳动能省下不少时间。

这一页分三部分：先讲清楚 LLM、Agent 和 Agent Harness 分别是什么；再以 **ChatGPT 订阅** 和 **DeepSeek API** 为例，说明开始使用前要准备什么；最后是让 AI 帮你干活的实用技巧，以及必须守住的学术规范。

内容来自 [Issue #90](https://github.com/Conduit-Club/SHOU-Online-Manual/issues/90)。

:::tip[核验时间]
最近核验：**2026-10-24**。AI 产品更新很快，模型名、价格、额度和安装方式以文中链接的官方页面为准。
:::

## 一、先分清三个概念

### LLM：会“思考”和“说话”的大脑

LLM（Large Language Model，大语言模型）是用海量文本训练出来的模型，例如 GPT 系列、DeepSeek 系列。你给它一段输入（提示词，prompt），它生成一段输出。

单独的 LLM 只能“说”，不能“做”：它看不到你电脑里的文件，也不能自己运行代码。你在网页里和它聊天时，所有材料都要靠你复制粘贴进去，结果也要靠你自己复制出来。

### Agent：能动手干活的助手

Agent（智能体）是在 LLM 外面接上了 **工具** 和 **循环** 的程序。它拿到任务后会反复执行“想一步 → 调用工具 → 看结果 → 再想下一步”，直到任务完成或需要你确认。常见的工具包括：

- 读取、搜索、修改文件；
- 在终端里运行命令，例如编译、运行测试、安装依赖；
- 联网搜索、抓取网页；
- 调用其他服务（通过 MCP 等协议接入）。

所以同样问“这个程序为什么报错”，聊天机器人只能根据你贴的片段猜；Agent 可以自己打开相关文件、运行一遍程序、看到真实报错，再动手修改并重新验证。

### Agent Harness：Agent 的工作台和规章

Harness 原意是“挽具”。Agent Harness 指的是把模型“套”起来、让它安全稳定干活的那一层软件，也就是你实际安装和打开的那个程序。它负责：

- 把工具（文件、终端、浏览器等）提供给模型；
- 管理上下文：项目说明、对话历史、过长时自动压缩；
- 管理权限：哪些操作可以直接执行，哪些要先问你；
- 读取项目规则文件（例如 `AGENTS.md`），记住这个项目的约定。

常见的 Harness 有 OpenAI 的 [Codex](https://github.com/openai/codex)、Anthropic 的 Claude Code、开源的 OpenCode，以及 DeepSeek 推出的 [DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)（技术预览）等。很多 Harness 不绑定某一家模型，可以通过配置换用不同厂商的 API。

### 一张表看懂三者关系

| 概念          | 打个比方                       | 你接触到的形态                         | 例子                            |
| ------------- | ------------------------------ | -------------------------------------- | ------------------------------- |
| LLM           | 大脑                           | 网页聊天、API 接口                     | GPT 系列、DeepSeek 系列         |
| Agent         | 会用工具、能自己推进的助手     | 在你的项目里读写文件、跑命令           | 让它“修好这个报错并跑通测试”    |
| Agent Harness | 助手的工作台、工具箱和规章制度 | 你安装的命令行工具、桌面端或编辑器插件 | Codex、Claude Code、OpenCode 等 |

记住一句话就够了：**模型决定它有多聪明，Harness 决定它能做什么、能做到多安全。**

## 二、使用前置条件

### 通用准备

无论选哪种方案，都建议先准备好：

- **一台自己的电脑**：Windows、macOS 或 Linux 都可以。Agent 会在你的电脑上读写文件、运行命令，公共机房电脑不适合保存账号和密钥。
- **会打开终端**：Windows 用 PowerShell 或 Windows Terminal，macOS 用“终端”。不需要精通命令行，但要能复制命令、看懂报错大概在说什么。
- **安装 Git**：用 Git 管理项目，Agent 改坏了可以一键回退。Windows 可安装 [Git for Windows](https://git-scm.com/download/win)。
- **一个专门的工作目录**：把要交给 Agent 处理的文件放在单独的文件夹里，不要直接在“桌面”或整个用户目录里启动 Agent。
- **一个模型来源**：下面两种方案二选一，或者都准备。

### 方案 A：ChatGPT 订阅 + Codex

适合已经有 ChatGPT 付费订阅、希望少折腾配置的同学。

1. **确认订阅与地区**：根据 Codex 官方 README，ChatGPT 的 Plus、Pro、Business、Edu、Enterprise 等方案都包含 Codex 的使用额度，不需要另外为 Codex 付费；各方案的价格和额度以 [OpenAI 官方说明](https://help.openai.com/en/articles/11369540-codex-in-chatgpt) 为准。OpenAI 只在其公布的支持国家和地区提供服务，使用前请自行确认所在地区是否受支持，并遵守相关法律法规和学校网络使用规定。
2. **安装 Codex CLI**：Windows 在 PowerShell 中执行官方安装脚本，或在已安装 Node.js 的情况下用 npm 安装：

   ```powershell
   # 官方安装脚本（Windows）
   powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"

   # 或者使用 npm
   npm install -g @openai/codex
   ```

   macOS / Linux 可用 `curl -fsSL https://chatgpt.com/codex/install.sh | sh` 或 `brew install --cask codex`。习惯用编辑器的同学也可以安装 VS Code 的 Codex 插件，或使用桌面端。

3. **登录**：进入项目目录，运行 `codex`，选择 **Sign in with ChatGPT**，在浏览器中完成登录。
4. **开始使用**：在终端里直接用中文描述任务即可。

订阅制的好处是费用固定、不用管 token 单价；限制是有使用额度，用满后要等额度恢复或升级方案。

### 方案 B：DeepSeek API

适合想按量付费、在国内网络环境下直接使用的同学。DeepSeek API 同时兼容 OpenAI 和 Anthropic 两种接口格式，可以接入 Codex、Claude Code、OpenCode 等多种 Harness。

#### 1. 注册、充值和创建 API Key

1. 打开 [DeepSeek 开放平台](https://platform.deepseek.com/)，按页面提示注册并登录。
2. 在平台中充值。费用从充值余额（或赠送余额）中扣减，**余额用完就停止调用**，不会出现“先用后付、月底账单爆炸”的情况。
3. 在 API Keys 页面创建一个 Key（以 `sk-` 开头），**创建后立即保存**，之后可能无法再次查看完整内容。

#### 2. 了解模型和价格

以下为 2026-10-24 在 [DeepSeek 模型 & 价格](https://api-docs.deepseek.com/zh-cn/quick_start/pricing) 页面核验的信息，单位为“元 / 百万 tokens”：

| 项目               | 时段     | `deepseek-flash` | `deepseek-v4-pro` |
| ------------------ | -------- | ---------------- | ----------------- |
| 输入（缓存命中）   | 空闲时段 | 0.02             | 0.15              |
|                    | 高峰时段 | 0.04             | 0.30              |
| 输入（缓存未命中） | 空闲时段 | 1                | 4.5               |
|                    | 高峰时段 | 2                | 9.0               |
| 输出               | 空闲时段 | 4                | 13.5              |
|                    | 高峰时段 | 8                | 27.0              |

- **高峰时段**：北京时间周一至周五（不含法定节假日）9:00–12:00、14:00–18:00；其余时间（含周末和法定节假日全天）都是空闲时段，价格减半。大批量任务可以安排在晚上或周末跑。
- **怎么选模型**：`deepseek-flash` 便宜、速度快，还支持图片输入，日常任务先用它；遇到复杂的多步骤任务再换 `deepseek-v4-pro`。两者上下文长度均为 1M tokens。
- **联网搜索另计费**：Search / Fetch 接口按成功请求次数计费（每 1,000 次 5 元）。官方说明在 DeepSeek Harness / Claude Code / Codex 中自动触发的搜索调用将于北京时间 **2026-11-01 00:00** 起开始收费。
- Agent 会反复读取文件和上下文，消耗的 token 远多于普通聊天。先小额充值试用，观察一下自己的实际花费。

#### 3. 接入 Harness

官方文档为多种工具写了接入教程，入口见 [DeepSeek API 文档 · 接入 Agent 工具](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/codex)。以 Codex 为例：

1. 先按方案 A 的方法安装 Codex，并至少运行过一次（让 `~/.codex` 目录生成）。
2. 运行 DeepSeek 提供的一键配置脚本。Windows 在 PowerShell 中执行：

   ```powershell
   irm https://cdn.deepseek.com/api-docs/codex-deepseek-setup.ps1 | iex
   ```

   macOS / Linux 执行 `bash <(curl -fsSL https://cdn.deepseek.com/api-docs/codex-deepseek-setup.sh)`。

3. 按菜单选择：第 1 项使用 `deepseek-flash`，第 2 项使用 `deepseek-v4-pro`，第 9 项恢复默认配置。首次运行时输入你的 API Key。脚本会先把原来的 `~/.codex/config.toml` 备份到 `~/.codex/backup-deepseek/`。

Claude Code、OpenCode 等工具的配置方式见同一文档中对应的页面，一般只需设置 `base_url`（OpenAI 格式为 `https://api.deepseek.com`，Anthropic 格式为 `https://api.deepseek.com/anthropic`）、API Key 和模型名。

:::warning[运行脚本前先看一眼]
`irm ... | iex`、`curl ... | sh` 这类命令会直接执行从网上下载的脚本。只运行官方文档里给出的地址，不要运行来路不明的“一键脚本”或“破解版”。
:::

### 两种方案怎么选

| 对比项     | ChatGPT 订阅 + Codex             | DeepSeek API                            |
| ---------- | -------------------------------- | --------------------------------------- |
| 计费方式   | 按月订阅，有使用额度             | 预充值，按 token 用量扣费               |
| 适合谁     | 已有订阅、想开箱即用             | 用量不固定、想精确控制花费              |
| 网络与地区 | 需在 OpenAI 支持的地区使用       | 国内可直接访问                          |
| 可用工具   | Codex 的 CLI、编辑器插件、桌面端 | Codex、Claude Code、OpenCode 等多种工具 |
| 主要风险   | 额度用尽要等待恢复               | API Key 泄露会被别人盗刷余额            |

## 三、使用技巧：让 AI 帮你干活

### 把任务说清楚

Agent 不是读心术。一个好的任务描述通常包含四件事：

1. **目标**：要做成什么样。
2. **背景**：相关文件在哪里、用的什么语言和工具。
3. **约束**：哪些不能改、要遵守什么格式或要求。
4. **验收标准**：怎样算完成，例如“测试全部通过”“输出一个 CSV，每行一个学生”。

可以参考这样的写法：

```text
目标：修复 src/main.py 运行时报的 KeyError。
背景：这是数据结构课的作业，输入文件是 data/input.txt，用 Python 3.12 运行。
约束：不要修改 data/ 目录里的文件，不要引入新的第三方库。
验收：运行 python src/main.py 不再报错，输出与 expected.txt 一致。
先告诉我你认为的原因，再动手修改。
```

### 先计划，再动手

复杂任务先让 Agent 只读不改：“先阅读项目，列出你打算怎么做，不要修改文件”。确认方向没问题后再让它执行。这样比它一口气改了十几个文件之后你再去纠正要省事得多。

### 小步推进，随时可以回退

- 开工前先用 Git 提交一次当前状态（`git add -A` 后 `git commit`）。
- 一次只给一个明确的小任务，完成后检查改动（`git diff`），没问题再提交。
- 改坏了就回到上一次提交，不要在一团乱的状态上继续让它“再修修”。

### 用规则文件让它记住项目约定

多数 Harness 会自动读取项目根目录下的规则文件，例如 Codex 读取 `AGENTS.md`，Claude Code 读取 `CLAUDE.md`。把这些内容写进去，就不用每次重复交代：

- 项目是做什么的，目录结构怎么组织；
- 怎么安装依赖、怎么运行、怎么测试；
- 代码风格、提交信息格式等约定；
- 哪些目录或文件不许动。

本仓库根目录的 `AGENTS.md` 就是一个现成的例子。

### 管好权限

Harness 一般有几档权限：只读、修改工作目录内文件前询问、完全自动。刚开始用建议选“执行命令或修改文件前先问我”，看清楚它要做什么再批准。尤其留意删除文件、`git push`、安装软件、修改系统设置这类操作。

### 适合交给 Agent 的事

| 场景           | 可以这样说                                                         |
| -------------- | ------------------------------------------------------------------ |
| 调试代码       | “运行这个程序，找出报错原因并修复，修完后再运行一遍确认。”         |
| 读懂陌生项目   | “阅读这个仓库，告诉我入口在哪里、主要模块各负责什么。”             |
| 处理实验数据   | “把 data/ 下所有 CSV 合并，去掉空行，按日期排序，画一张折线图。”   |
| 批量整理文件   | “把这个文件夹里的照片按拍摄日期重命名为 年-月-日_序号.jpg。”       |
| 排版与格式     | “把这份 Markdown 笔记转成 LaTeX，按 report 模板排版并编译成 PDF。” |
| 写脚本和小工具 | “写一个脚本，每次运行时自动备份这个目录到 backup/ 并按日期命名。”  |

### 不能交给 Agent 的事

- **替你完成要求独立完成的作业、考试和论文正文**。课程是否允许使用 AI、允许用到什么程度，以任课老师和学院的要求为准；不确定就先问老师。论文写作中的 AI 使用边界，可参考 [发论文实用工具](/study/paper-tools.html) 中的说明。
- **替你做最终判断**。Agent 会自信地给出错误答案，也可能编造不存在的文献、函数或数据。事实、引用、数字和结论都要自己核对。
- **处理敏感数据**。不要把身份证号、学号密码、他人个人信息、未公开的科研数据或保密材料交给在线模型。

## 学术规范与安全

- **遵守课程和学校的规定**。在作业、报告和论文中使用 AI 前，先确认老师和学院的要求；需要说明 AI 使用情况的，如实说明。
- **保护 API Key**。Key 相当于你账户余额的钥匙：不要发到群里、不要写进代码提交到 GitHub、不要截图分享。怀疑泄露就立即在平台上删除并重新创建。
- **控制花费**。按量付费的方案先小额充值，定期查看用量；订阅制注意额度和自动续费。
- **备份重要文件**。让 Agent 处理重要资料前，先备份或用 Git 提交，确认改动无误后再覆盖原文件。

## 参考来源

- [DeepSeek API 文档 · 模型 & 价格](https://api-docs.deepseek.com/zh-cn/quick_start/pricing)：2026-10-24 访问，核验模型名、价格、高峰时段、Search / Fetch 计费与扣费规则。
- [DeepSeek API 文档 · 接入 Codex](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/codex)：2026-10-24 访问，核验一键配置脚本与菜单选项。
- [DeepSeek API 文档 · 首次调用 API](https://api-docs.deepseek.com/zh-cn/)：2026-10-24 访问，核验 base_url 与接口格式。
- [openai/codex README](https://github.com/openai/codex)：2026-10-24 访问，核验 Codex CLI 安装方式与 ChatGPT 登录说明。

还想找课程资料或论文工具？查看 [刷 GPA 实用网站](/study/learning-sites.html) 和 [发论文实用工具](/study/paper-tools.html)。

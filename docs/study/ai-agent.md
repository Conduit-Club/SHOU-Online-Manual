---
id: ai-agent
slug: /study/ai-agent.html
comment_id: doc-ai-agent
---

# AI Agent 使用指南

平时用大模型还停留在"打开网页、粘贴报错、等回复、手工改代码"这个循环吗？**AI Agent（智能体）** 可以完全改变这个流程。它能直接进驻你的项目目录，自己读代码、运命令、改源码、跑测试，最后给你看清楚的 Git 改动。调试作业、批量清理数据、整理文献这些重复工作，用 Agent 能省去大量时间。

本文覆盖：

1. LLM、Agent 和 Harness 各是什么，有什么区别
2. ChatGPT 官方订阅 + Codex 的开箱即用方案
3. DeepSeek API 的低成本方案，以及用 CC Switch 管理多个提供商
4. 怎样向 AI 下达清晰的指令——"人话 Prompt" 和高阶约束模板
5. AI 的真实能力上限在哪里
6. Computer Use（让 AI 操作桌面）的风险与防护
7. 学术规范和账号安全

内容来自 [Issue #90](https://github.com/Conduit-Club/SHOU-Online-Manual/issues/90)。

:::tip[核验时间]
最近核验：**2026-10-24**。AI 工具与模型迭代频繁，模型版本、计费标准、客户端安装命令请以文内各官方文档链接为准。
:::

---

## 一、先分清三个概念：LLM、Agent 与 Harness

```text
┌─────────────────────────────────────────────────────────────┐
│                    Agent Harness（工作台 / 宿主程序）        │
│   负责权限审批、文件读写调度、终端执行、上下文管理、读取 AGENTS.md │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                 Agent（智能体循环）                  │   │
│   │   "制定计划 → 挑选工具 → 执行操作 → 观察结果 → 迭代"  │   │
│   │                                                     │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │             LLM（大语言模型 / 大脑）          │   │   │
│   │   │       负责理解意图、推理逻辑、生成文本与指令     │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1. LLM（大语言模型）：只有大脑

GPT、Claude、DeepSeek 这类都是 LLM。它的工作原理：用海量文本训练，然后根据你输入的提示词来预测和生成下一段文字。

局限很明显：看不到你电脑里的文件，也没法运行任何编译命令。你在网页聊天，所有东西都要自己复制粘贴。

### 2. Agent（智能体）：给 LLM 装上手脚

Agent 在 LLM 外面加了一个自主循环：思考 → 行动 → 观察 → 反复迭代。

具体过程：

1. **思考**：看到你的需求，判断第一步怎么做
2. **行动**：决定用什么工具——执行 `git status`、读取 `src/index.js`、搜索东西
3. **观察**：看工具的真实输出（比如报错信息），重新分析
4. **迭代**：继续下一步，直到完成

和聊天的区别：聊天面对报错只能凭经验猜；Agent 会自己去翻文件、复现报错、改代码、再验证，直到真正解决。

### 3. Agent Harness（工作台）：给 Agent 套上约束

Harness 的原意是套在马身上的马鞍。没有它，Agent 拿到终端权限就像脱缰的马，可能删错目录这样不可逆。

它做的事：

- **供工具**：提供文件读写、代码搜索、终端执行这类工具
- **守门员**：拦截危险命令（删系统文件、推代码等），弹窗让你手确认
- **管上下文**：处理长对话，当快超出模型限制时自动压缩
- **读规则**：启动时自动找项目根目录的 `AGENTS.md` 或 `CLAUDE.md`

常见的 Harness：

- **Codex**（OpenAI 官方）：支持 CLI、VS Code、桌面端
- **Claude Code**（Anthropic 官方）：终端工具，任务规划体验好
- **开源**：OpenCode、OpenClaw 等

---

## 二、方案一：ChatGPT 官方订阅 + Codex（开箱即用）

如果你已经是 ChatGPT 付费会员（Plus、Pro、Team、Edu），这是最轻松的上手方案。

### 1. 订阅权益与计费说明

- Codex 的使用额度已经内嵌在 ChatGPT 订阅里了，不需要额外购买
- 同一份订阅可以在网页、CLI、桌面、VS Code 等各个地方用
- 需要在 OpenAI 支持的国家和地区访问，要遵守相关法律法规和校园网规范

### 2. 界面选择：GUI 永远对新手最友好

很多人习惯命令行，但对大多数同学来说，**桌面客户端**往往最直观、最省心：

- **Codex Desktop**：
  - 左边是项目文件树，能看到 AI 改了哪几个文件
  - 中间是对话框
  - 右边是 Git 风格的代码对比，红绿标出增删
  - 需要运命令时会弹窗，点鼠标确认或拒绝即可

- **Claude Desktop**：
  - 配合 Claude 的项目管理和可视化画板
  - 支持 Developer 模式和本地 MCP 服务器

### 3. 安装与登录（CLI 命令行方式）

打开终端（Windows 用 PowerShell，macOS/Linux 用 Terminal）：

- **Windows 用户（PowerShell）**：

  ```powershell
  powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"
  ```

  或者用 npm（需要已安装 Node.js）：

  ```powershell
  npm install -g @openai/codex
  ```

- **macOS / Linux 用户**：
  ```bash
  curl -fsSL https://chatgpt.com/codex/install.sh | sh
  # 或用 Homebrew
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
   # 或启动桌面图形界面
   codex app
   ```
3. 终端会弹菜单，选 **Sign in with ChatGPT**。它会打开浏览器，登录确认后返回终端开始对话。

### 4. Codex 常用技巧

进入 Codex 交互终端后，除了输入自然语言，你还可以随时输入 `/` 开头的指令来控制会话：

- **`/model`**：切换模型档位（日常任务用轻量版，复杂任务用深度推理版）
- **`/compact`**：压缩上下文。多轮交互后用这个清理冗余，既省额度又防止跑题
- **`/review`**：对当前工作区未提交的改动进行代码评审
- **`/permissions`**：查看和调整权限
- **`Ctrl + C`** 中止、**方向键 `↑`** 找回刚才输入

---

## 三、方案二：DeepSeek API + 接入各大 Harness（性价比与自由度）

如果想按实际使用量扣费、享受国内网络直连、不想每月交固定外币订阅费，**DeepSeek API** 是目前性价比极高的选择。

更棒的是：DeepSeek 原生兼容 OpenAI 和 Anthropic 的 API，你可以直接把它接入 Codex 或 Claude Code。

### 1. 注册与前期准备

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)，用手机号或邮箱注册
2. 充值。DeepSeek 是预充值模式，余额为 0 自动停服，不会莫名其妙收天价账单。新用户有赠送额度
3. 创建 API Key。进 **API Keys** 页面创建，格式是 `sk-xxxxxxxx`。**创建时立即复制保存，关闭后看不到了**

### 2. 模型特点与价格参考

以下为 [DeepSeek 官方文档](https://api-docs.deepseek.com/zh-cn/quick_start/pricing) 核验的计费标准（单位：元 / 百万 tokens）：

| 模型名称              | 推荐用途                                         | 输入（缓存命中）               | 输入（未命中）                 | 输出                             | 上下文大小 |
| :-------------------- | :----------------------------------------------- | :----------------------------- | :----------------------------- | :------------------------------- | :--------- |
| **`deepseek-flash`**  | 日常编码、单文件排错、批量脚本编写、支持图片分析 | 空闲 0.02 元<br />高峰 0.04 元 | 空闲 1.00 元<br />高峰 2.00 元 | 空闲 4.00 元<br />高峰 8.00 元   | 1M tokens  |
| **`deepseek-v4-pro`** | 复杂算法推导、大规模重构、高难度深度思考         | 空闲 0.15 元<br />高峰 0.30 元 | 空闲 4.50 元<br />高峰 9.00 元 | 空闲 13.50 元<br />高峰 27.00 元 | 1M tokens  |

- **时段省钱**：工作日 9-12、14-18 是高峰；其他时段（晚间、双休、节假日）半价
- **缓存便宜**：Agent 经常重复读项目文件，缓存命中几乎不花钱
- **网页抓取**：Search/Fetch 功能按每千次 5 元计费

### 3. 接入实战 A：将 DeepSeek 接入 OpenAI Codex

Codex 的 CLI、VS Code、桌面端都用同一份配置。可以用一键脚本或手动配置。

#### 方式一：官方一键脚本（最省心）

确保已安装 Codex 并至少运行过一次。

- **Windows 用户（PowerShell）**：
  ```powershell
  irm https://cdn.deepseek.com/api-docs/codex-deepseek-setup.ps1 | iex
  ```
- **macOS / Linux 用户（终端）**：
  ```bash
  bash <(curl -fsSL https://cdn.deepseek.com/api-docs/codex-deepseek-setup.sh)
  ```

运行后会弹菜单：选 `1` 用 deepseek-flash（性价比首选），或选 `2` 用 deepseek-v4-pro，选 `9` 切回官方 ChatGPT。首次运行时把 `sk-` 开头的 API Key 粘贴进去。

#### 方式二：手动配置（了解原理）

如果想保留官方配置或需要精细控制，可以手动改：

- 模型元数据：`~/.codex/models.json`
- 主配置：`~/.codex/config.toml`

核心配置段：

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

:::tip[切换模式后历史记录丢了吗？]
很多同学在切到 DeepSeek 后发现 ChatGPT 模式下的历史消失了，以为被清空了。

**没有丢。** Codex 按认证方式隔离会话。用脚本选 `9` 切回官方，原来的会话就会完好无损地重新出现。

想同时用两种模式可以指定不同配置目录：

```powershell
$env:CODEX_HOME="$HOME/.codex-deepseek"; codex
```

:::

### 4. 接入实战 B：将 DeepSeek 接入 Anthropic Claude Code

Claude Code 是 Anthropic 的终端 Agent 工具，交互风格极客、自动多步探索能力强。因为 DeepSeek 兼容 Anthropic API，我们同样可以低成本跑 Claude Code。

#### 第一步：安装 Claude Code

- **npm 全局安装**（需 Node.js 18+）：
  ```bash
  npm install -g @anthropic-ai/claude-code
  ```
- **Windows 原生安装（PowerShell）**：
  ```powershell
  irm https://claude.ai/install.ps1 | iex
  ```
  _（建议配合 [Git for Windows](https://git-scm.com/download/win)）_

#### 第二步：配置接入

##### 姿势一：用 CC Switch GUI（最推荐）

频繁改环境变量很烦。开源工具 **[CC Switch](https://github.com/farion1231/cc-switch)**（官网 `ccswitch.io`）就是为了解决这个问题：

1. 下载安装。Windows 去 Releases 下，macOS 用 `brew install --cask cc-switch`
2. 打开 CC Switch，选 Claude Code，添加 Provider，选 **DeepSeek** 或填 `https://api.deepseek.com/anthropic`
3. 粘贴 API Key，点启用
4. CC Switch 在后台改配置，以后切换只需点一下，不用手动改 shell 配置

##### 姿势二：手动注入环境变量

**Windows PowerShell 用户（临时测试）：**

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

- **Windows**：执行 `notepad $PROFILE`，把上面这组 `$env:...` 粘贴到个人配置文件末尾，保存。下次打开 PowerShell 自动生效
- **macOS / Linux**：打开 `~/.bashrc` 或 `~/.zshrc`，用 `export ANTHROPIC_BASE_URL="..."` 写法追加，执行 `source ~/.zshrc`

#### 第三步：Claude Code 核心使用

启动 `claude` 后进入全屏交互界面：

- **权限模式随心切（`Shift + Tab`）**：在输入框按 `Shift + Tab` 在 Manual（每步问）、acceptEdits（自动接受文件改动）、Plan（仅规划）之间快速切换
- **`/init` 命令**：在新项目里敲 `/init`，Claude Code 会深度阅读目录结构和依赖配置，为你自动生成高质量的 `CLAUDE.md` 项目指南
- **`/plan` 模式**：输入 `/plan 你的复杂需求`，它进入只读思考阶段，列出周全的执行步骤和受影响模块，等你审核敲定后才开始改代码
- **`/rewind`（时光倒流）**：按两次 `Esc` 或敲 `/rewind`，将代码和对话状态一键回退到几个步骤之前的检查点

---

## 四、实战进阶：怎样像带实习生一样指挥 AI 干活

有了强大的工具，产出质量的核心就在于你与 AI 的沟通方式。很多同学抱怨"AI 乱改文件""越修 Bug 越多"，大多是因为沟通方式还停留在"把 AI 当百宝箱"而不是"把 AI 当初级工程师"。

### 1. 清晰的指令

别只说"帮我写个选课系统"。Agent 需要清楚的背景和约束才能稳定交付高质量代码。通常包括：

| 要素     | 说明             | 示例                                              |
| :------- | :--------------- | :------------------------------------------------ |
| **目标** | 要达成什么       | "修复 `src/api/auth.js` 刷新 Token 时的崩溃"      |
| **背景** | 技术栈、目录结构 | "Node.js 20 + Express 后端，认证在 `middleware/`" |
| **约束** | 不能动什么       | "不改数据库 Schema，不加新依赖，不改现有工具函数" |
| **验收** | 怎样算做好了     | "运 `pnpm test` 单测全绿"                         |

### 2. 约束模板

下面这些规则可以存进提示词库，或直接贴在项目根目录的 `AGENTS.md` / `CLAUDE.md` 中：

#### 模板 A：高效代码检索

AI 容易一次性读大文件或用粗法脚本翻找，几秒烧完数十万 token。用这条约束它：

```text
【代码检索规范】
1. 在探索代码仓库与查找函数、类、配置时，必须优先使用 ripgrep（rg）进行精准关键词或正则表达式搜索；
2. 严禁未经筛选全量读取超过 500 行的长文件；
3. 严禁执行会产生海量终端输出的命令（如无过滤的 tree、find、cat 大日志），避免污染上下文窗口。
```

#### 模板 B：Windows PowerShell 7 约束

AI 容易混淆 cmd、旧版 PowerShell 5.1 和新版 7，写出别名或编码错误的脚本：

```text
【终端环境约束（Windows pwsh 7）】
1. 当前终端环境为现代 PowerShell 7（pwsh）。严禁使用旧版 cmd.exe 或 Windows PowerShell 5.1 的专有语法；
2. 严禁使用容易产生歧义的别名（例如禁止使用 curl，必须使用真实命令或通用 node/python 脚本）；
3. 命令拼接严格遵循 pwsh 规范，避免跨平台转义字符（如反引号 ` 与反斜杠 \）造成的解析失误；
4. 文件读写必须显式指定为 UTF-8 无 BOM 编码，禁止产生 GBK 乱码；
5. 换行符严格遵循仓库已有规范，严禁触发全文件 CRLF/LF 误改。
```

#### 模板 C：Git 开发规范

```text
【Git 协作纪律】
1. 开始任何修改前，先运行 git status 确认当前分支与工作区状态；
2. 遵循最小修改原则：只修改与当前 Issue 强相关的文件，严禁顺带对无关文件做全局格式化或大面积重构；
3. 修改后必须执行项目测试或构建验证命令，以实际退出码为准，不得主观推测"已通过"；
4. 验证通过后使用 git diff 自查，确认无误后编写清晰的 Conventional Commits 提交信息。
```

---

## 五、AI 的能力上限与清醒认知

使用 AI Agent 最容易陷入两个坑：要么觉得它是"无所不能的银弹"全自动撒手不管；要么试了一次跑错就全盘否定。明确它的真实能力边界很重要。

### 1. AI Agent 的强项

- **快速写样板代码**：根据现有风格快速输出完整的 CRUD、数据解析器、格式转换器
- **定位深层报错**：在大项目里顺着堆栈找到根本原因，提供精确的改法
- **补全测试用例**：读业务代码后自动补单元测试、模拟边界情况

### 2. AI Agent 的局限

- **没有业务判断力**：不知道你的导师或客户真正想要什么架构。战略拆分、技术选型必须人来决定
- **上下文衰减**：虽然支持 1M tokens，但长链路任务里交互超过一定轮次后，模型对前文细节的专注力下降，甚至开始"自作主张"。要定时用 `/compact` 压缩或开新会话
- **虚假自信**：会写出看起来严密、注释齐全，但在高并发、边界值、浮点精度下完全错误的代码。**没通过自动化测试验证的 AI 代码就是未完成代码**

---

## 六、进阶：Codex Computer Use（电脑操作）与风控指南

除了改代码，**Codex Computer Use** 这类"屏幕操作型 Agent"让 AI 可以操作你整个操作系统。

### 1. Computer Use 是什么

AI 定期截屏，识别屏幕上的按钮、输入框、菜单，然后模拟点击、滚动、输入和应用切换。

常见场景：

- **跨系统搬运数据**：学校老系统没 API，让 AI 照屏幕把 Excel 逐行录入到桌面软件中
- **UI 自动化测试**：让 AI 打开新写的网页或客户端，模拟用户操作，检查布局和崩溃

### 2. Computer Use 的风险

开启它等于把键盘鼠标交给 AI。风险必须升到最高等级。

> [!CAUTION]
> **风险一：屏幕隐私泄露**
>
> Computer Use 要把屏幕截图上传给云端来识别界面。**启动前务必退出微信、QQ、网银、邮箱、密码管理器这类有隐私的软件！** 否则聊天记录和账户信息都会被传给模型。

> [!WARNING]
> **风险二：误点危险按钮**
>
> AI 辨识复杂界面时可能出错，误把"注销账号""清空数据""确认付款"当成普通按钮。
>
> 防护：在设置开启 **"Scoped Apps"**，限制 AI 只能在指定浏览器或测试窗口操作，禁止全局桌面；高危操作每步人工确认。

> [!TIP]
> **风险三：死循环烧额度**
>
> 网页弹出验证码时，AI 可能陷入"没反应 → 狂点 → 截图 → 再狂点"。几分钟就烧完额度。发现卡住立即打断。

---

## 七、学术规范与安全红线

在校园学习和学术科研中运用 AI，必须恪守底线，让技术成为助力而非学术污点。

### 1. 学术规范

- **不能让 AI 直接代写作业和论文**。大学各门课程对大模型有明确规定，代写属于学术不端。不确定就问老师或导师
- **防虚构文献**。AI 会自信地编造作者、篡改数据、捏造从未存在过的 API。所有论文文献、实验数据、事实数据都要自己到权威库中核实。看 [发论文实用工具](/study/paper-tools.html) 了解规范
- **自己要能解释清楚**。即使 AI 帮优化了某段算法或重构了模块，你也要确保自己逐行读懂。答辩或评审时说"这是 AI 写的我不懂"是无法接受的

### 2. 账号和隐私

- **API Key 不能公开**。Key 等于电子钱包：
  - 不要把含 Key 的脚本推 GitHub
  - 不要在微信群、论坛分享含 Key 的截屏
  - 泄露了立即删除、重新生成
- **不要上传敏感数据**。别把学号、身份证号、教务系统密码、实验室保密数据传给商用模型

---

## 参考与核验来源

- [OpenAI Codex 官方仓库](https://github.com/openai/codex)：2026-10-24 核验 CLI 安装脚本、ChatGPT 订阅授权机制与常用命令
- [DeepSeek 官方 API 文档 · 模型与价格](https://api-docs.deepseek.com/zh-cn/quick_start/pricing)：2026-10-24 核验模型命名、高峰/空闲时段计费及搜索服务规则
- [DeepSeek 官方 API 文档 · 接入 Codex](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/codex)：2026-10-24 核验一键配置脚本与 `config.toml` 配置段
- [DeepSeek 官方 API 文档 · 接入 Claude Code](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code)：2026-10-24 核验 Anthropic 协议兼容端点、模型环境变量映射关系
- [Anthropic Claude Code 官方文档](https://code.claude.com/docs/)：2026-10-24 核验安装命令、交互模式快捷键、权限等级与 `CLAUDE.md` / `AGENTS.md` 兼容支持
- [CC Switch 官方仓库](https://github.com/farion1231/cc-switch)：2026-10-24 核验 Claude Code 多提供商 GUI 切换与热配置机制

---

想查阅其他学习资源或论文工具？看 [学习网站](/study/learning-sites.html) 和 [论文工具](/study/paper-tools.html)。

# Ask BENZEMA's Wiki — Recipes

> 25 个具体的 prompts，按角色分类。复制粘贴到任何接好 MCP 的 Claude / Cursor / Cline 即可。
> 不知道这个 endpoint 能拿来干嘛？看下面的 recipes，找到你的角色。

---

## 🎯 Endpoint

```
https://benzema-wiki-mcp-production.up.railway.app/mcp
```

接入方式见 [README.md](./README.md#-one-click-install)。

---

## 📊 Knowledge Base 覆盖的领域

- **Agent 基础设施**：Communication (MCP/A2A), Memory, Loop, Runtime, Sub-agent, Tool Routing
- **Agent Harness**：kimi-cli, Claude Code, kosong, agent-vault 完整源码评审 (~19,000 LOC)
- **World Model**：49 篇论文索引（带引用数和质量评级）+ 五大技术路线 + Sora 之死分析
- **Creative AI**：Creative CoWork 产品研究 + 4 组漫剧团队访谈 + 视频 Agent 工作流
- **LLM Wiki Pattern**：Karpathy 范式 + Knowledge Agent Network 设计
- **Richard Chien 完整生态**：38 GitHub repos 深度分析 + agent-vault / kosong / kimi-cli 源码

---

## 👥 按角色分类的 25 个 Prompts

### 🎩 角色 1：投资人 / VC（5 个 prompts）

5 分钟判断一个 Agent 创业者的深度，不用约电话。

```
1. "BENZEMA 对 Agent Economy 的核心机会判断是什么？他识别的最大缺口在哪一层？"

2. "如果你想在 2026 投 Agent 基础设施，BENZEMA 的研究告诉你应该避开哪些坑？"

3. "BENZEMA 怎么对比 kimi-cli 和 Claude Code 的工程哲学？这对评估 agent harness 创业者有什么启示？"

4. "BENZEMA 对国内 AI 产品创业第一笔融资有什么具体建议？他识别的 super-individual 趋势是什么？"

5. "给我 BENZEMA 对 World Model 三种定义的分析，以及他认为缺失的 benchmark 在哪。"
```

**用法**：投资人想快速了解 BENZEMA 这个人在思考什么 → 把这 5 个 prompts 喂给自己的 Claude → 5 分钟读完答案 → 决定是否约电话。

---

### 👨‍💻 角色 2：Agent 开发者 / 工程师（5 个 prompts）

绕过 Stack Overflow + ChatGPT 瞎编，直接查看过 19,000 行源码的人。

```
1. "kimi-cli 和 Claude Code 在 tool execution 并发模型上有什么不同？sync handle / async future 是什么？"

2. "agent-vault 的 placeholder 模型怎么工作？有哪些可以直接借鉴到我自己 agent 的设计？"

3. "如果我要做一个 agent-native IM，我应该看哪些项目？slock.ai / HiClaw / RockClaw 各自的取舍是什么？"

4. "kosong 的 Empty Layer 哲学是什么？相比 LangChain / LiteLLM 的核心区别在哪？"

5. "Claude Code 的 per-tool isConcurrencySafe 谓词怎么设计？为什么 read 工具能并发但 write 工具会变成栅栏？"
```

**用法**：你正在写 agent，遇到具体设计问题 → 别去 Stack Overflow → 直接问 → 拿到源码级答案带文件路径引用。

---

### 🎓 角色 3：研究者 / 学者（5 个 prompts）

跨研究互通，省几十小时重复劳动。

```
1. "World Model 领域过去半年（2025Q4-2026Q1）有什么大变化？Sora 之死、AMI Labs、LeWM 的影响是什么？"

2. "给我 BENZEMA 整理的 World Model 论文索引，按引用数排序，重点看 S-Tier。"

3. "Agent Communication 领域的 7 种通信模式是什么？哪些论文是必读的？"

4. "OASIS 1M agents 框架的核心创新是什么？三个 validation 实验各发现了什么？为什么 LLM agent 比真人更顺从？"

5. "MiroFish 为什么能 24 小时融到陈天桥的 $4.1M？BENZEMA 如何解构这个 anomaly？"
```

**用法**：研究新方向时，先问知识库有没有人替你做过基础调研，省 1-2 周文献综述。

---

### 📝 角色 4：内容创作者 / 写手（5 个 prompts）

给 AI 周报 / 播客 / 公众号提供可引用的"权威源"。

```
1. "BENZEMA 对 Sora 之死有什么观点？给我带原始论据的引用。"

2. "Karpathy 的 LLM Wiki Pattern 是什么？BENZEMA 是怎么落地实践的？给我可以直接引用的句子。"

3. "Vibe coding 时代 super-individual 创业的 3 个真实案例是什么？BENZEMA 的分析角度是什么？"

4. "Richard Chien (stdrc) 的工程哲学是什么？'I build ecosystems, not just software' 的具体含义是什么？"

5. "Knowledge Agent Network 是什么？为什么说它是 LLM Wiki Pattern 的自然演化？给我四阶段演进路径。"
```

**用法**：写 AI 内容时需要"权威观点 + 可追溯引用"→ 直接问 → 拿到带 source path 的答案。

---

### 🤝 角色 5：合作者 / 招聘方（5 个 prompts）

陌生人快速 onboard，了解 BENZEMA 这个人的研究版图。

```
1. "BENZEMA 主要研究哪些方向？给我一份 topic map 和深度排序。"

2. "BENZEMA 自己部署了什么产品？是怎么工作的？"

3. "BENZEMA 的 Creative CoWork 产品是什么？目标用户是谁？核心架构？"

4. "如果我要拉 BENZEMA 一起做一个 Agent 基础设施项目，他最有 unfair advantage 的部分是什么？"

5. "BENZEMA 的知识库一共多少篇 raw 文章 / wiki 概念 / output 报告？最新一篇是什么？"
```

**用法**：拉合作 / 招聘 / 投资前的"5 分钟尽调"，比读 LinkedIn 和翻博客快 10 倍。

---

## 🚀 进阶玩法

### 让 Claude 在不同知识库之间切换

```
"先看 BENZEMA 的 wiki，再上网搜索最新的 agent-native IM 产品。
对比 BENZEMA 的研究和最新的市场情况，告诉我哪些是过时的、哪些是新出现的。"
```

LLM 会先 call BENZEMA 的 endpoint，再 call WebSearch，做时间维度的 diff。

### 用 BENZEMA 的论文索引做选读

```
"用 BENZEMA 的 World Model 论文索引，给我推荐 5 篇适合 PhD 学生入门的论文。
每篇说一句为什么。"
```

LLM 调 `get_paper_index` 拿到结构化论文列表，按引用数和质量评级筛选。

### 跨主题 connection 挖掘

```
"BENZEMA 的知识库里有什么 connections 文章？哪一篇最值得读？为什么？"
```

LLM 调 `list_topics` 找到所有 connections 类文档，做 meta-level 推荐。

### Output 产出查询（AK Wiki 的核心）

```
"BENZEMA 最近一周做了哪些深度研究？给我看 output/reports 的内容。"
```

调 `get_log` 拿到时间线，再针对性 read_page。

---

## 🛠️ 6 个 Tools 速查

| Tool | 何时用 | 示例 |
|------|--------|------|
| `list_topics` | 第一次接触，看有什么 | "BENZEMA 知道什么？" |
| `get_index` | 看主索引（按领域分类） | "给我 BENZEMA 的主索引" |
| `read_page` | 读特定概念/地图/关联 | "读 agent-communication 这页" |
| `search_knowledge` | 全文搜索 | "搜 'kimi-cli'" |
| `get_paper_index` | 拿论文索引（带引用） | "World Model 论文" |
| `get_log` | 看最近的研究时间线 | "BENZEMA 最近做了什么？" |

LLM 会自动选 tool，你不用记。直接问问题就行。

---

## 🤖 这不是 ChatGPT

- **不是搜索**：是 LLM-compiled 的结构化知识
- **不是泛泛而谈**：每个回答都有 raw source 引用
- **不是模型瞎编**：模型只能看到 BENZEMA 真写过/真整理过的内容
- **不是博客**：是 1 周内 Claude Code + 真实研究产出的 28 概念 + 7 地图 + 8 关联 + 19 深度报告

---

## 💬 给 BENZEMA 反馈

发现回答错了 / 过时 / 不够深？
- GitHub Issue: [BENZEMA216/wiki-mcp-server/issues](https://github.com/BENZEMA216/wiki-mcp-server/issues)
- 直接发邮件 / X DM 给 [@BENZEMA216](https://github.com/BENZEMA216)

---

*Recipes maintained by [BENZEMA216](https://github.com/BENZEMA216) · Powered by [LLM Wiki Pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)*

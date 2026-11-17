# 行政勘误：feat-002-sop32-report-round4-01a1ea59

本评论只纠正报告 `feat-002-sop32-report-round4-01a1ea59`（原评论：https://github.com/jf3096/todo-app-lab/issues/14#issuecomment-6954401667 ）的事实记录错误。不修改原评论、事件、计数、卡片状态或业务结论，不开始新的验证轮，不构成新的 v3 PASS。

## 1. checked_at 勘误

原报告填写 `checked_at=2026-11-17T16:40:00.000Z`，但该评论远端 `created_at=2026-11-17T16:38:57Z`。原值晚于发布时间，不能用整点或估计值表示。

真实宿主轨迹确认：

- 视觉 CLI 输出完成：`2026-11-17T16:37:19.710Z`。来源：本验证会话的 `exec` 工具调用 `exec-612db31d-7516-4565-863a-57015b653857`（进程 `80282`，退出码 `0`），其宿主记录位于 `C:\Users\KSG\.codex\sessions\2026\11\18\rollout-2026-11-18T00-31-49-01a1ea59-b3b0-7492-a64f-b8869059d372.jsonl` 第 390 行 `item_completed`。该记录包含四个 `-i` 原始 PNG 路径、CLI 会话 ID 和完整标准输出。
- 正式 verification 评论发布：GitHub 评论 `6954401667` 的 `created_at=2026-11-17T16:38:57Z`。
- 本次正式验证回合完成：`2026-11-17T16:39:36.055Z`。来源：同一宿主会话第 477 行 `task_complete`，`turn_id=01a1ea59-b65d-7993-8b75-cd02e8e38713`，`started_at=1794933110`，`completed_at=1794933576`，`duration_ms=465673`。

结论：原报告 `checked_at` 应理解为错误填写的未来时间；可精确核对的最新检查完成时间是 `2026-11-17T16:39:36.055Z`。视觉完成时间单独是 `2026-11-17T16:37:19.710Z`，两者不能混写。

## 2. AC-02 四图证据与可访问观察

原报告 AC-02 只列出了一张 PNG 的 `evidence`，并把 `visual.width=1280`、`visual.theme=light-dark-responsive review` 写成该单一 URI 的属性，不能表示这张图的真实宽度和主题。实际视觉会话接收并显示了四张不同属性的原图。以下逐图给出卡片中的真实来源、宽度、主题、采集时间和哈希：

| 精确来源 | 真实宽度 | 真实主题 | 采集时间（UTC） | SHA-256 |
| --- | ---: | --- | --- | --- |
| https://github.com/jf3096/todo-app-lab/blob/31df4340a403ead9e6893589ff80a53aab9506cf/artifacts/feat-002-v3/prototype-review/evidence/todo-375-light.png | 375 | light | 2026-11-17T14:28:52.642Z | `0ad6d4912cc385760df659543a70a262bac9219f058c316dfb65b0c7d504cfa7` |
| https://github.com/jf3096/todo-app-lab/blob/31df4340a403ead9e6893589ff80a53aab9506cf/artifacts/feat-002-v3/prototype-review/evidence/todo-375-dark.png | 375 | dark | 2026-11-17T14:28:55.399Z | `3e1f6506a3f870570fc50b9b37fcfc0cf7ae6901457efb3423b6a49726ac9403` |
| https://github.com/jf3096/todo-app-lab/blob/31df4340a403ead9e6893589ff80a53aab9506cf/artifacts/feat-002-v3/prototype-review/evidence/todo-1280-light.png | 1280 | light | 2026-11-17T14:28:58.035Z | `92465ede56521c2e465c0c07f64f4ea10da2ed19cc882a188bb4a24aa5e22dad` |
| https://github.com/jf3096/todo-app-lab/blob/31df4340a403ead9e6893589ff80a53aab9506cf/artifacts/feat-002-v3/prototype-review/evidence/todo-1280-dark.png | 1280 | dark | 2026-11-17T14:29:00.184Z | `5327f518c89cffeb9e9893f193ff45d7d3c9b07bbd300d5ca8af04fc9dd2e411` |

本次实际 CLI 看图会话 ID：`01a1ea5e-4eb5-70f3-a5ae-0c5e7d9a79fb`。模型：`tokenhub/gpt-6.1-terra`；provider：`model-gateway`；sandbox：`read-only`。该 CLI 以 `--ephemeral` 启动，因此没有独立持久化的 rollout 文件；不得声称存在该 CLI 自身的 `input_image` 日志。可核对的是本验证会话真实 `exec` 工具调用保存的四个 `-i` 路径、CLI 退出/会话输出以及实际原始观察。

可跨会话访问的原始观察文件：

- https://github.com/jf3096/todo-app-lab/blob/6df7863d070986e798ba397288ead6557d9ba8f6/artifacts/feat-002-v3/prototype-review/verification-01a1ea59/visual-observation.json
- 该文件 SHA-256：`53d0b2977610732478c0bb719d1e3c8bf1f0d8fd33dee0eaef6d769e61fc907a`
- 内容包含 4 个 `images` 条目、P0/P1/P2 均为空、P3 一项；它记录的是本次视觉会话的原始返回，不是新的产品验收。

宿主取证边界与位置：

- `C:\Users\KSG\.codex\sessions\2026\11\18\rollout-2026-11-18T00-31-49-01a1ea59-b3b0-7492-a64f-b8869059d372.jsonl`
- 第 388 行：本线程 `exec` 工具调用，包含四个 `-i` 原始 PNG 输入和 CLI 启动参数。
- 第 390 行：执行 `exec-612db31d-7516-4565-863a-57015b653857` 完成记录，退出码 0，包含四个输入、CLI 会话 ID 和完整观察输出。
- 第 477 行：本正式验证回合完成记录。
- 该宿主轨迹是主验证会话日志，不是 ephemeral CLI 自身的持久化日志；四项输入由真实命令记录，四项观察由真实 CLI 标准输出留痕。

因此，原报告的 AC-02 证据列表只列一张图、并把该图宽度/主题写成整套响应式复核属性，是不完整且混合的行政记录；实际输入是四张，属性应逐图区分。此勘误只修正证据可追溯性，不改变原报告 `CANNOT_VERIFY` 的整体业务结论。

## 3. 预算精确值

当前停止提交的 `inner.iterations=1`、`inner.minutes=6.78155`；正式停止报告接受累计 `6` 轮/`53` 分钟。合计为 **7 轮/59.78155 分钟**。

本次命中 **7 轮次数上限**，不是分钟超过 60。分钟仍低于上限。不得把“达到 7 轮”写成“超过 60 分钟”，也不得据此自行扩额、清计数或开始新轮。

## 4. 边界

- 不修改原报告评论 `6954401667`。
- 不新增验证事件、业务尝试、正式验证轮或预算。
- 不改变卡片 `blocked`、`seq 14`、当前提交、`retries 2` 或 `no_progress 1`。
- 不修改产品、预览或托管状态。
- 本勘误不是新的 v3 PASS，不替代当前真实缺口。

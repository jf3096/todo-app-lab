# 停止提交来源核对（独立证据）

核对会话：01a1e9fa-81d5-74d2-aed6-f6bc88ca7d70。当前精确提交：https://github.com/jf3096/todo-app-lab/issues/14#issuecomment-6953250176 。影响意见：https://github.com/jf3096/todo-app-lab/issues/14#issuecomment-6953368620 。本文件只记录独立实查，不是产品或真人批准。

## 当前正式轮与累计

v3 CLI 的 sop exec / begin_verification 已 apply，并由 service 于 2026-11-17T16:02:29.613Z 实际回读：

- revision=1，seq=8，status=awaiting_verification。
- active_review=feat-002-sop32-budget-review-01a1e9fa；reviewer_id 与当前宿主 CODEX_THREAD_ID 相同，且不同于 executor_id。
- current_submission=feat-002-sop32-budget-halt-43bfba8；inner.outcome=halted，blocker.kind=budget。
- 三份已接受提交 inner 累加：2/24 + 2/6 + 2/23 = 6轮/53分钟；当前预算仍4轮/40分钟。
- retries=1，no_progress=0；旧正式报告、旧提交、开放反馈和全部事件保留。
- human_reviews=0，prototype_confirmation=null，pending_record不存在。

## 对象、字节与 kind

卡片执行方法明确要求 artifact.version 为实际被审原型，不是测试归档提交。前置 3.1 当前已完成，绑定原型 5ba90f604f52c215c227c294ad44667a50342893；当前停止提交 commit_sha/version 都为该 SHA，changed_at=2026-11-17T13:48:03Z 与 Git 提交时间一致。归档另用不可变 URI：e13702e4f5a6651dca80a64a20e945dc5f434128 与 43bfba8b6ba62851d7a8a7d8aecc4183a61e2b35。

实际从 GitHub contents API 解码并重算 SHA-256（没有输出原始 base64）：

| 文件 | Git blob | SHA-256 | 观察 |
| --- | --- | --- | --- |
| result.json@e13702e | c42851ffac872b5a11414b09fe86006b58b7acb0 | bc78d883ac71724893677d3d7c9d44b82eedaff39bdf7015c19811ceb35aaa2a | 内部 artifact_version=5ba90f；机器采集始于14:28:38.822Z，完成14:29:00.619Z。新停止提交已正确标 report。 |
| visual-conflict-review.md@3844ff4 | 8615b0e39174210c4be00a3f620f3a346f111b28 | 7ca9d44cd3bc901470a74243c9298b9f9caadf9c6357c725fa947226ed046170 | 静态四图观察、P3理由与能力边界；明确不证明点击、键盘、对比度或其他状态。本轮不重新裁定视觉等级。 |
| final-report.md@e13702e（旧报告） | 5b4870d79caa69445603694d0dd123c7ddbb76f1 | 1a03c0c92a951c87200a9d0703dfd9526766bc0be584257642a4757aa29183cb | 历史报告。宿主写入调用15:29:48.328Z、返回15:29:49.727Z；Git提交15:29:55Z。 |
| final-report.md@43bfba8（当前修订） | b476e5922113658a995d2ea4a212ec9103ec01cd | 7201ee8b799645dd74bcf0dbe6b795e6cb6753edadcf5616e52900f769fe8856 | 新停止提交已标 report；Git author/committer为15:41:05Z，不把归档时间冒充当前读取动作。 |

以上具体时间均为 2026-11-17 UTC。

## 未完成的来源/交接补正

视觉实际发生在独立只读 CLI 会话 01a1ea19-2f6d-7c62-b9dd-54bcef436751，不是本主会话原生输入。本轮只定向读取其 session/task_started、最终答案和 task_complete，不读取执行者完整推理。宿主记录：session/task_started=2026-11-17T15:21:23.397Z，最终答案=15:21:42.367Z，task_complete=15:21:47.071Z。

当前停止提交 AC-02 的 captured_at/visual.reviewed_at 及 final-report.md@43bfba8 仍把 15:21:23.046Z 称为“审阅完成”。该值早于会话开始，不能作为完成时间。旧正式报告时间勘误亦已公开，不能再回填旧值。不推断图像审阅没发生或产品出现新缺陷。

当前43bf报告正文还称“本补正报告”对应 e13702e/1a03c0...，且在“补正证据归档/当前累计/状态应进入”使用2c1ace8、4轮/30分钟、正常待人工确认等旧快照；当前对象却是43bf归档、6轮/53分钟、halted。若这些是历史，必须明确标注为历史并另列当前快照。新正常更正未被接受，与新 halted 已被接受必须区分。现有完整确认清单仍保留，来源说明问题不等于用户拒绝或业务实现失败。

## 独立预算反证与恢复边界

在 seq6 的真实 bundle 上，正常新提交下限1轮/0分钟及只改来源字段的内存副本均返回 INNER_BUDGET_EXHAUSTED；route_rework 返回 REWORK_STATE。宿主先前15:42:18.049Z的工具结果亦记录同码，但本轮结论以自己的复算和正式历史为准。

内存中 halted(budget) 可据实登记超预算停止，不等于正常提交或 PASS。后来真实停止已登记2轮/23分钟，因此旧4/30和“只加1轮、分钟不变”的恢复估计不再适用。恢复后正常更正若实际c轮/m分钟（c>=1），总预算须至少6+c轮、53+m分钟；相对原4/40需增量至少2+c轮、13+m分钟。轮数下限7；m未知，不猜测，也不把反证中的0当真实耗用。

只允许正式核验停止后由编排者按实际状态、报告和用户授权另记一次性有限决定，走合法的同卡revision路由。不得从awaiting_human/awaiting_verification直接route_rework、改marker扩额、造blocked或no_progress，不能清累计或触碰五次外环硬上限。真人门仍待真实来源；停止提交整体不能PASS。

## 只读范围与功能复核

GitHub compare：31df→e137只新增允许的prototype-review证据；e137→43bf只修改其final-report.md。无产品、公开预览、main、托管修改。

本轮独立功能结果见同目录 evidence/result.json。执行开始16:02:00.238Z、结束16:02:10.719Z，HTTP三资源200且逐字节等于5ba90f树内previews/pr-10/2e88373资源。新隔离Chromium上下文只用合成localStorage：空白校验、新增UTC与本地显示、刷新持久化、完成/筛选/删除、旧数据无时间、无效时间保留、存储异常均实际通过；无外部请求，浏览器和上下文已关闭。未重新生成截图，未将DOM或功能结果当视觉通过。

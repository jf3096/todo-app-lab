# FEAT-002 SOP-3.2：修订 2 证据交接

本报告是记录补正，不是产品或预览修复，不代表真人批准或讨论完成。被审原型为 `5ba90f604f52c215c227c294ad44667a50342893`，公网入口：https://jf3096.github.io/todo-app-lab/previews/pr-10/2e88373/ 。证据归档的提交另由本报告的不可变 URI 标识，不是新的原型版本。

## 历史和当前记录

- 历史正常提交 `feat-002-sop32-submission-e13702e1` 及归档 `e13702e4f5a6651dca80a64a20e945dc5f434128` 保留；旧报告中的 `1a03c0`、`e137`、`2c1ace8` 和 4 轮/30 分钟均为历史快照。
- 后续更正归档 `43bfba8b6ba62851d7a8a7d8aecc4183a61e2b35` 的 `final-report.md` 实际 SHA-256 为 `7201ee8b799645dd74bcf0dbe6b795e6cb6753edadcf5616e52900f769fe8856`（以不可变原始字节为准）。该文件仍含旧状态和错误视觉时间，不能作为当前结论。
- 已接受的是停止提交 `feat-002-sop32-budget-halt-43bfba8`，正式停止报告：https://github.com/jf3096/todo-app-lab/issues/14#issuecomment-6953652371 。该报告核定恢复前累计 6 轮/53 分钟；恢复后的正常提交以本轮实际事件和读回为准，不能提前称作已发布。
- 修订 2 只允许一次记录发布，累计上限 7 轮/60 分钟；实际新耗用记在本轮 submission 中，不清零。

## 视觉来源校正

原始四张 PNG 均存于 `31df4340a403ead9e6893589ff80a53aab9506cf` 的 `artifacts/feat-002-v3/prototype-review/evidence/`。本轮从远程不可变原始字节计算哈希：

| 图 | 采集 UTC | SHA-256 |
| --- | --- | --- |
| todo-375-light.png | 2026-11-17T14:28:52.642Z | 0ad6d4912cc385760df659543a70a262bac9219f058c316dfb65b0c7d504cfa7 |
| todo-375-dark.png | 2026-11-17T14:28:55.399Z | 3e1f6506a3f870570fc50b9b37fcfc0cf7ae6901457efb3423b6a49726ac9403 |
| todo-1280-light.png | 2026-11-17T14:28:58.035Z | 92465ede56521c2e465c0c07f64f4ea10da2ed19cc882a188bb4a24aa5e22dad |
| todo-1280-dark.png | 2026-11-17T14:29:00.184Z | 5327f518c89cffeb9e9893f193ff45d7d3c9b07bbd300d5ca8af04fc9dd2e411 |

真实 CLI 看图会话 `01a1ea19-2f6d-7c62-b9dd-54bcef436751` 的全部观察输出于 `2026-11-17T15:21:42.367Z`；`15:21:47.071Z` 是任务结束，不是视觉观察时间。旧 `15:21:23.046Z` 早于会话开始，不可作为完成时间。依据：[正式来源审计](https://github.com/jf3096/todo-app-lab/blob/3ca1ec396dea03ae57e680f4af113be737831b4d/artifacts/feat-002-v3/independent-sop32-01a1e9fa/budget-stop-43bfba8/source-audit.md) 和 [视觉观察](https://github.com/jf3096/todo-app-lab/blob/3844ff4521c65e00b4786313fdf6b90353f12297/artifacts/feat-002-v3/independent-sop32-01a1e9fa/evidence/visual-conflict-review.md)。

历史观察为层级清楚、控件边界可辨、时间可读、无遮挡或横向溢出；长事项控件与标题首行距离较大，作为 P3 延期，未发生修复。静态图不证明点击、键盘或对比度。两条当前开放反馈的补正须交原评价方复验，执行者不自行关闭。

## 真实功能来源与范围

既有 [机器报告](https://github.com/jf3096/todo-app-lab/blob/e13702e4f5a6651dca80a64a20e945dc5f434128/artifacts/feat-002-v3/prototype-review/evidence/result.json) 于 2026-11-17T14:29:00.619Z 完成，记录合成数据下新增、刷新、旧及无效时间、输入校验、完成/筛选/删除和存储异常；浏览器和上下文已关闭。报告类型是 report，不是视觉图。本轮未重跑或重拍，未修改产品、预览或托管。前置冻结预览资源与公网匹配，但候选源码与公网预览有差异，不能混为同一份源码。

## 待真人确认清单

1. 整体 UI 保留品牌、输入、筛选、列表和页脚，在标题下显示创建时间。
2. 建议固定中文 `zh-CN`、24 小时、精确到分钟；时区跟随浏览器本地。前置文档的“系统语言环境”文字与固定中文需澄清，不能默认为语言随系统改变。
3. 旧数据缺失时间显示“创建时间未知”；无效时间显示“创建时间无效”并保留原值；确认存储异常和临时模式。
4. 确认新增、刷新、完成、筛选、删除、空态、输入校验、长文本及异常交互；不增加编辑时间、相对时间、秒级刷新、同步、账号、后端或演示控制。
5. 拟改 `app.js`、`styles.css`、`tests/todo.spec.cjs`，预计不改 `index.html`；测试时间/持久化、旧及无效数据、长文本、现有操作、存储异常和 375/1280 明暗状态。确认候选源码与公网预览差异及 P3 长事项扫描距离。

这只是待确认建议。真人尚未确认当前版本和完整范围；不写批准、讨论完成或进入 SOP-4.1。

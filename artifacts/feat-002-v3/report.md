# FEAT-002 SOP-1 校验与重放

## 结论

在候选版本 `6b2d3cc987b09a05d85276d2f36b02be85a67040` 上执行添加和刷新后，Todo 事项存在，但列表项不显示创建时间。合成存储也只有 `id`、`text`、`completed`。调查结论为：`GAP_CONFIRMED`。

本报告只调查现状。它不实现创建时间，不批准原型，也不把本结果视为产品完成。

## 版本与环境

- 仓库：`jf3096/todo-app-lab`
- 远程 `main`：`6b2d3cc987b09a05d85276d2f36b02be85a67040`
- 隔离 worktree：固定在同一完整 SHA，分支为 `codex/feat-002-sop1`。
- 本地入口：`http://127.0.0.1:4173/`，由 `npm start` 启动，HTTP 200。
- GitHub Pages 最新构建：`https://api.github.com/repos/jf3096/todo-app-lab/pages/builds/1374404862`，状态 `built`，commit 为同一完整 SHA。
- GitHub Pages 部署：`https://api.github.com/repos/jf3096/todo-app-lab/deployments/7821008060`，environment 为 `github-pages`，sha 为同一完整 SHA。
- 线上入口：`https://jf3096.github.io/todo-app-lab/`，查询时 HTTP 200。
- 运行时：Windows `win32`，Node `v26.13.0`，Playwright `1.65.0`，Chromium `156.0.8078.4`。
- 浏览器上下文：新 isolation context，locale `zh-CN`，存储只包含本轮合成数据。

## 方法与观察

1. 冷读子卡和根工单，核对候选 SHA、原生子关系与 v3 契约。
2. 以候选 SHA 创建隔离 worktree，不从本地旧 `HEAD` 重放。
3. 在 `#task-input` 填入唯一文本 `v3-created-at-check`，点击 `button[type="submit"]`。
4. 提交后检查 `#task-list > li.task-item` 的 `time`、`[data-created-at]`、`.task-created-at` 及存储。
5. 刷新页面，使用同一路径再次检查 DOM 和存储。

提交后的列表项为：

```html
<li class="task-item"><label class="task-label"><input type="checkbox" class="task-check" data-id="5cae160b-a0d7-4b78-9657-10714e78c2b1"><span class="task-text">v3-created-at-check</span></label><button type="button" class="delete-button" aria-label="删除：v3-created-at-check" data-id="5cae160b-a0d7-4b78-9657-10714e78c2b1">删除</button></li>
```

提交后存储为：

```json
[{"id":"5cae160b-a0d7-4b78-9657-10714e78c2b1","text":"v3-created-at-check","completed":false}]
```

刷新后 DOM 和存储均与提交后一致；`timeText`、`dataCreatedAt`、`createdAtClassText` 都为空，`hasTime`、`hasDataCreatedAt`、`hasCreatedAtClass` 都为 `false`。页面无 page error，无 console error。

## 响应式与主题

| 宽度 | 主题 | 列表项宽度 | 横向溢出 | 创建时间 |
| --- | --- | ---: | --- | --- |
| 375px | light | 305px | false | 无 |
| 1280px | light | 622px | false | 无 |
| 375px | dark | 305px | false | 无 |
| 1280px | dark | 622px | false | 无 |

实际打开四张截图后确认：当前列表项、删除按钮和添加按钮可见，375px 与 1280px 均无横向滚动；明暗主题可读。由于创建时间本身不存在，本报告不能给出未来时间显示的视觉通过结论。

## 回归

在同一隔离服务上运行候选仓库现有测试，11 个用例全部通过，耗时 9.8 秒。覆盖新增、空白输入、完成切换、筛选、删除、刷新持久化、文本注入防护、损坏或不可用存储，以及 375px/1280px 明暗布局。

首次测试启动未进入业务用例：配置要求自启服务，但端口已被本轮隔离服务占用。随后使用只读临时配置连接该服务，测试通过。

## 变更边界与清理

- 未修改 `app.js`、`styles.css`、`index.html`、`tests/**`、`.github/**` 或 `.env`。
- 本地产品代码与候选 SHA 保持一致；报告和重放脚本只写入 `artifacts/feat-002-v3/`。
- 使用隔离浏览器上下文，只生成合成事项，不使用真实用户数据。
- 已停止自己启动的 `npm start` 服务，并回读确认 `127.0.0.1:4173` 不再监听。

## 证据哈希（SHA-256）

- `replay-result.json`：`8ce0afe59dc1e4f6e1adf05ee66d101612223903dded1528a7e17f71d2614053`
- `layout-result.json`：`025f383936afc27d25c8d0564dee99ea735e79ed7d9675113e57637ebde50bef`
- `replay-after-submit.png`：`f88d1c5cf00619dea596cfe8d35b894634e267e17030016480f040866ed7f406`
- `replay-after-reload.png`：`8a8fd86a24bd8417b99872bda179caaff1ce43577078df1529c9d3e8bf548ad6`
- `layout-375-light.png`：`e9651d31dfaede39cdcf7ab60856be65530fbb0d79e781b2b03f6dd65ece25ef`
- `layout-375-dark.png`：`868f72489eed958dfd7749fc3f91d97059a7ae5b4c3ca939ea8cbaff56dddceb`
- `layout-1280-light.png`：`f88d1c5cf00619dea596cfe8d35b894634e267e17030016480f040866ed7f406`
- `layout-1280-dark.png`：`83164e56733e0227f0d0c8cc6b7e84b4fbbf1d0bca5ee15fefd18798b10c1a84`

## 风险与未决项

- 创建时间尚未实现；本卡只冻结缺口事实与候选基线。
- 时间格式、时区、旧版无时间数据的展示方案仍需在原型阶段讨论并由真人确认。
- 截图与 JSON 是候选 SHA 的现状证据，不代表未来实现版本通过。

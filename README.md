# Todo App Lab

一个不需要构建的中文 Todo 网页，使用 HTML、CSS 和原生 JavaScript。

在线使用：<https://jf3096.github.io/todo-app-lab/>

## 功能与边界

- 添加事项（去除首尾空格，1–200 个字符），支持 Enter 提交。
- 标记完成、恢复未完成、按状态筛选、删除单条事项。
- 自动保存到当前浏览器的 localStorage，刷新后恢复。
- 适配手机、桌面和系统明暗主题，支持键盘操作。
- 无账号、无后端，不上传数据，也不跨设备同步。清除浏览器数据会移除待办。
- 存储被禁用、空间不足或保存的数据损坏时显示提示，并进入临时模式。损坏的原数据不会被静默覆盖。

## 本地使用

直接打开 `index.html` 即可使用。推荐通过本地服务器访问，避免不同浏览器对本地文件存储的差异：

```sh
npm start
```

打开 <http://127.0.0.1:4173/>。运行页面无需安装依赖。

## 验证

需要 Node.js 20 或以上版本和 Google Chrome。测试依赖只用于开发，不进入线上页面。

```sh
npm ci
npm test
```

没有 Chrome 时，执行 `npx playwright install chromium`，并设置 `PW_CHANNEL=chromium` 后运行测试。
设置 `BASE_URL=https://jf3096.github.io/todo-app-lab/` 可对线上页面运行同一套测试；测试使用独立浏览器上下文，不改仓库或真实用户数据。

测试覆盖新增、空输入、完成切换、筛选、删除、刷新持久化、文本注入防护、损坏或不可用存储，以及 375px/1280px 明暗主题布局。

## 发布

GitHub Pages 使用 `main` 分支根目录，`.nojekyll` 关闭 Jekyll 处理。推送到 `main` 后自动发布，无构建步骤、外部 CDN 或运行时依赖。
页面入口为 `index.html`，相对路径加载 `styles.css` 与 `app.js`，兼容仓库子路径。
如需回退代码，revert 对应提交后推送；发布设置位于仓库 Settings → Pages。

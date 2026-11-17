# FEAT-002 · SOP-3.2 技术核对

本目录是 #14 当前卡的技术与视觉复核产物，不是产品实现。

## 审查对象

- 当前卡：https://github.com/jf3096/todo-app-lab/issues/14
- 前置独立 PASS：https://github.com/jf3096/todo-app-lab/issues/13#issuecomment-6950520107
- 原型版本：`5ba90f604f52c215c227c294ad44667a50342893`
- 公网入口：https://jf3096.github.io/todo-app-lab/previews/pr-10/2e88373/

## 复跑

```powershell
node artifacts/feat-002-v3/prototype-review/verify.mjs
```

脚本只打开公网版本，使用新的非持久化浏览器上下文和合成 `localStorage`，结束时关闭自己创建的浏览器。脚本不启动服务、不修改产品或旧预览。

## 当前边界

技术自验不等于真人确认。时间语言/时区、旧数据与异常方案、拟改文件和测试计划仍需用户确认。

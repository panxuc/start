# 贡献指南

感谢你愿意改进 start。

## 本地开发

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:3000`。

## 提交 Pull Request 前

请先运行：

```bash
pnpm lint
pnpm test
pnpm build
```

PR 尽量保持聚焦。UI 改动请说明改动前后的差异；存储或 API 改动请说明影响哪种部署模式。

## 项目结构约定

- 公开页的导航和站点设置通过服务端 store 模块加载。
- 共享校验逻辑放在 `app/lib`。
- 可视化后台先编辑草稿，点击保存后才写入存储。
- `START_STORAGE_DRIVER=readonly-config` 是 fork 后最安全的默认模式。
- `START_STORAGE_DRIVER=local-file` 面向 Docker、VPS、NAS 等自托管场景。
- `START_STORAGE_DRIVER=vercel-blob` 面向配置了 Vercel Blob 的 Vercel 部署。

## 提交 Issue 时请提供

- 部署模式：Vercel Blob、本地文件或只读配置。
- Node 版本和 pnpm 版本。
- 复现步骤。
- 预期行为和实际行为。

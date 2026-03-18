# 江湖恩怨录（xianxia-journal）

一款融合仙侠美学的本地优先个人记事应用：记录生活中的珍贵瞬间（浮生录）与人际恩怨（恩仇簿），支持导入/导出 JSON 备份迁移。

## 功能特性

- ✅ 浮生录：新增/编辑/删除记录，支持搜索与筛选（心境/场景）
- ✅ 恩仇簿：人物档案管理，支持关系筛选与“恩怨值”排序
- ✅ 人物详情：记录并管理与某人的“恩/仇事件”
- ✅ 藏经阁：一键传书（导出 JSON）/ 收录（导入 JSON，覆盖现有数据）
- ✅ 标题生成：为浮生录提供“拟 AI”标题灵感

## 技术栈

- 前端：React + React Router + Vite
- 本地存储（Web）：IndexedDB（基于 `idb`）
- 桌面端（可选）：Electron（通过 preload bridge 暴露 IPC）
- 代码规范：ESLint（flat config）

## 软件截图

> 说明：仓库目前内置的是“占位示意图”，你可以用真实截图覆盖 `docs/screenshots/` 下同名文件。

| 归墟（首页） | 浮生录 | 恩仇簿 | 藏经阁 |
| --- | --- | --- | --- |
| ![归墟](docs/screenshots/home.svg) | ![浮生录](docs/screenshots/moments.svg) | ![恩仇簿](docs/screenshots/grudges.svg) | ![藏经阁](docs/screenshots/settings.svg) |

## 快速开始（Web 版本）

### 系统要求

- Node.js 18+（推荐 20+）
- Windows/macOS/Linux 均可

### 安装与启动

```bash
npm install
npm run dev
```

打开开发服务器提示的地址即可使用。

### 构建与预览

```bash
npm run build
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 桌面端（Electron，可选）

### 开发模式

```bash
npm run electron:dev
```

### 打包

```bash
npm run electron:build
```

说明：

- 桌面端会使用本地 SQLite 数据库存储数据，数据库文件位于系统的用户数据目录下（`xianxia-journal.db`）。
- 当前 `electron/main.js` 依赖 `better-sqlite3`，但仓库依赖清单未声明该包；若你需要使用桌面端，请先补齐该依赖并确保原生模块可在本机构建。

## 数据与备份

- Web 版本数据存储在浏览器本地（IndexedDB），不会上传到任何服务器。
- 进入“藏经阁”可：
  - 传书：导出全部数据为 JSON 文件（用于备份/迁移）
  - 收录：从 JSON 文件导入数据（会覆盖现有全部记录）
- 仓库根目录自带一份示例导出文件：`江湖恩怨录_2026-1-16.json`

## 项目结构

```text
electron/           Electron 主进程与 preload
public/             静态资源
src/
  components/       业务组件（表单、卡片、布局等）
  pages/            页面（归墟/浮生录/恩仇簿/人物详情/藏经阁）
  utils/            工具函数（标题生成等）
  db.js             本地数据层（IndexedDB；导入导出）
```

## 使用说明（建议工作流）

1. 在“浮生录”记录当下的片刻，按心境/场景筛选回看
2. 在“恩仇簿”维护人物档案，在“人物详情”记录恩/仇事件
3. 定期在“藏经阁”执行“传书备份”，避免浏览器数据被清理导致丢失

## 贡献指南

1. Fork 本仓库并新建分支
2. 保持变更聚焦、通过 `npm run lint` 与 `npm run build`
3. 提交 PR 并描述变更动机与验证方式

# 沪知化学 · 上海高中化学学习辅助平台

按学期、教材单元组织的上海高中化学学习辅助站点，覆盖高一至高三六个学期的化学知识点，提供知识点讲解、检索、复习与化学互动演示。

- 知识点：534 个（六学期化学目录）
- 互动演示：化学平衡、中和滴定、反应速率 3 个实验室交互模型
- 技术栈：React 19 + Vite 8 + TypeScript，纯前端静态产物，无后端

## 在线访问

GitHub Pages 地址：`https://zrx-11.github.io/shanghai-chem-lab/`

## 目录结构

- 仓库根目录：`npm run build` 产出的静态站点文件（`index.html`、`assets/`、`favicon.svg`），GitHub Pages 直接服务该目录。
- `app-source/`：Vite 工程源码（TypeScript 源码、配置、裁剪脚本与验证脚本）。
- `LICENSE`：上游 MIT 许可证，保留原作者版权声明。

## 本地构建

```bash
cd app-source
npm install
npm run build      # 产物输出到 app-source/dist
npm run preview    # 本地预览
```

## 来源与协议

本仓库由上游公开仓库 [wuhy80/shanghai-high-school-lab](https://github.com/wuhy80/shanghai-high-school-lab) 裁剪而来，仅保留化学学科内容；其余学科（语文、数学、英语、物理、生物、政治、历史、地理、信息科技）的目录种子、课文模块与视觉组件已移除。

- 上游许可证：MIT License，原作者 Copyright (c) 2026 wuhaiyan，许可证全文见 `LICENSE`。
- 课程目录与讲解文案的归属以上游仓库为准；本仓库仅做学科剥离与工程部署，未重新编写学科内容。

## 裁剪与验证说明

- 种子数据：三个学期种子文件中仅保留 `chemistry` 课程块；裁剪前原件备份在 `app-source/_strip/backup/`。
- 课文模块：删除数学、物理、人文课文模块，化学课文优先命中化学族模板，未命中时回退到科学通用模板与通用兜底模板。
- 视觉组件：删除数学视觉目录与物理视觉组件；化学图解组件全部保留。
- 验证脚本：`app-source/_strip/verify_local.mjs`（目录、搜索、移动端溢出、控制台错误）与 `app-source/_strip/verify_demos.mjs`（三个互动演示逐学期渲染核验）。
- 已知事项：`app-source/tests/lab.spec.ts` 为上游遗留的 Playwright 用例，未随本次裁剪同步更新；构建时的 chunk 体积警告在上游基线即存在。

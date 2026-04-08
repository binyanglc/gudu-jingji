# 孤独经济 · 创意产品设计

第 28 课课堂活动 —— 学生用中文描述产品，AI 自动生成概念图。

## 功能

- **学生端**：选择小组 → 按模板写中文产品介绍（含指定生词和语法）→ AI 生成图片 → 提交
- **老师端**：展示墙实时显示所有组的作品，点击可放大，适合投屏展示
- 每组最多生成 5 次图片，无需登录

## 部署到 Vercel（3 步）

### 第 1 步：部署代码

1. 将此项目推送到 GitHub 仓库
2. 登录 [vercel.com](https://vercel.com)，点击 **Add New → Project**
3. 导入你的 GitHub 仓库，点击 **Deploy**

### 第 2 步：配置 Upstash Redis（数据存储）

1. 在 Vercel 项目页面，点击 **Storage** 标签页
2. 点击 **Create Database** → 选择 **Upstash Redis**（免费）
3. 按提示创建，环境变量 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN` 会自动配置

### 第 3 步：添加 OpenAI API Key

1. 在 Vercel 项目页面，点击 **Settings → Environment Variables**
2. 添加变量：
   - Name: `OPENAI_API_KEY`
   - Value: 你的 OpenAI API Key
3. 点击 **Save**
4. 回到 **Deployments** 页面，点击最新部署的 **⋯ → Redeploy**

部署完成！把网站链接发给学生即可。

## 页面说明

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 学生选择小组 |
| 工作区 | `/group/1` ~ `/group/4` | 写介绍、生成图片、提交 |
| 展示墙 | `/gallery` | 老师投屏用，自动刷新 |

## 费用估算

- DALL-E 3：$0.04/张（标准质量）
- GPT-4o-mini：~$0.001/次（翻译 prompt）
- 4 组 × 5 次 ≈ **$0.82**

## 本地开发

```bash
# 复制环境变量文件
cp .env.local.example .env.local
# 填入你的 OPENAI_API_KEY

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

本地开发不需要 Redis，数据会存在内存中（重启后丢失）。

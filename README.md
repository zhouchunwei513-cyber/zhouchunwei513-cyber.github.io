# 小秘.com - 智能AI助手网站

> 基于 GitHub Pages 部署的个人AI助手网站，包含主站和后台管理面板。

## 项目信息

| 项目 | 值 |
|------|------|
| 域名 | 小秘.com |
| 站点地址 | https://zhouchunwei513-cyber.github.io |
| 统计API | https://api.aiduty.asia |
| 后台地址 | https://zhouchunwei513-cyber.github.io/admin.html |

## 文件结构

```
├── index.html      # 主站页面
├── admin.html      # 后台管理面板
├── CNAME           # 自定义域名配置
├── .nojekyll       # 禁用Jekyll
└── README.md       # 项目说明
```

## 功能特性

### 主站 (index.html)
- 现代化深色主题UI，紫蓝渐变设计
- 动态浮动背景动画
- 响应式布局，适配移动端
- 实时统计数据展示（总访问量/今日访问/在线用户）
- 滚动渐入动画效果
- 浮动对话入口

### 后台管理 (admin.html)
- 密钥登录认证（默认密钥: xiaomi2026）
- 数据概览仪表盘
- 访问趋势图表（7天/每小时）
- 设备分布饼图
- 来源分析
- 最近访客记录表
- 页面访问排行
- 30秒自动刷新数据
- API在线状态检测
- 本地数据降级方案（API不可用时使用模拟数据）

## 部署方式

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "小秘.com 网站上线"
git branch -M main
git remote add origin https://github.com/zhouchunwei513-cyber/zhouchunwei513-cyber.github.io.git
git push -u origin main
```

### 2. 配置 GitHub Pages
- 仓库设置 → Pages → Source: main branch
- 自定义域名: 小秘.com（CNAME文件已配置）

### 3. 域名解析
在域名DNS管理中添加：
```
类型: CNAME
主机: @
值: zhouchunwei513-cyber.github.io
```

## 统计API接口

前端调用以下API端点（均指向 https://api.aiduty.asia）：

| 端点 | 方法 | 用途 |
|------|------|------|
| /api/track | POST | 上报页面访问 |
| /api/stats | GET | 获取总览统计 |
| /api/trend?days=7 | GET | 获取趋势数据 |
| /api/hourly | GET | 获取每小时数据 |
| /api/devices | GET | 获取设备分布 |
| /api/sources | GET | 获取来源分布 |
| /api/visitors?limit=N | GET | 获取最近访客 |
| /api/visitors/all?limit=N | GET | 获取所有访客 |
| /api/pages | GET | 获取页面统计 |

所有API请求失败时，前端自动降级为本地模拟数据，不影响页面展示。

## 技术栈

- HTML5 + CSS3（原生）
- JavaScript (ES6+)
- Chart.js 4.4.0（CDN）
- Google Fonts (Noto Sans SC)

## 更新日志

- 2026-08-20: 项目初始化，主站和后台管理面板上线

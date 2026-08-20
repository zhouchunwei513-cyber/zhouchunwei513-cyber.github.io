# 小秘.com - 智能AI助手网站

> 基于 GitHub Pages 部署的个人AI助手网站，包含主站和后台管理面板。

## 项目信息

| 项目 | 值 |
|------|------|
| 域名 | 小秘.com |
| 站点地址 | https://小秘.com （https://zhouchunwei513-cyber.github.io） |
| 统计服务 | 不蒜子 busuanzi.ibruce.info（真实数据，无需注册/后端） |
| 后台地址 | https://小秘.com/admin.html |

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
- 真实统计数据展示（总浏览量/独立访客/本页浏览，来源：不蒜子）
- 滚动渐入动画效果
- 浮动对话入口

### 后台管理 (admin.html)
- 密钥登录认证（默认密钥: xiaomi2026）
- 数据概览仪表盘（总浏览量/独立访客/本页浏览/人均浏览 — 真实数据）
- 访问趋势图表（7天/每小时 — 演示数据）
- 设备分布饼图（演示数据）
- 来源分析（演示数据）
- 最近访客记录表（演示数据，区域支持真实IP归属地解析到县/区）
- 页面访问排行（真实数据，由不蒜子数据推导）
- 统计服务在线状态检测
- 本地数据降级方案

## 统计方案说明

**真实数据（不蒜子，JSONP 方式调用）：**
- 站点总浏览量 site_pv、独立访客数 site_uv、当前页面浏览量 page_pv
- JSONP 不受 CORS 限制，适配 GitHub Pages 纯静态托管
- 每次请求会计一次浏览量，因此前端只加载一次、不做轮询

**演示数据（需要后端统计服务才能变为真实）：**
- 趋势/小时/设备/来源分布图表、访客明细记录
- 原定的 api.aiduty.asia 存在两个问题未解决：
  1. 需要登录认证（所有接口返回 401 未登录，登录端点为 POST /api/auth/login）
  2. 未配置 CORS 响应头（OPTIONS 预检返回 204 但无 Access-Control-Allow-Origin）
- 若后续接入自建统计后端，需在服务端为 https://xn--yet060e.com（小秘.com 的 punycode 形式）配置 CORS

## 部署方式

### 1. 推送到 GitHub

```bash
git add .
git commit -m "更新网站"
git push origin main
```

### 2. GitHub Pages 已配置
- Source: main 分支（已设置）
- 自定义域名: 小秘.com（CNAME文件已配置，HTTPS 已强制）

### 3. 域名解析（已生效）
```
类型: CNAME
主机: @
值: zhouchunwei513-cyber.github.io
```

## 技术栈

- HTML5 + CSS3（原生）
- JavaScript (ES6+)
- Chart.js 4.4.0（CDN）
- Google Fonts (Noto Sans SC)
- 不蒜子统计（JSONP）

## 更新日志

- 2026-08-20: 项目初始化，主站和后台管理面板上线
- 2026-08-20: 主页移除后台入口；访客记录支持省/市/县区区域显示；统计切换为不蒜子真实数据（原 aiduty API 因 401 认证 + CORS 未配置而放弃）

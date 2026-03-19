# 📅 CalendarApp - 智能日程管理应用

一款基于 **React Native** 和 **Expo** 框架开发的跨平台日程管理应用，支持 iOS、Android 和 Web 平台。提供多视图日历展示、智能通知提醒、农历节假日显示等实用功能，帮助用户高效管理日常事务。

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript)

---

## ✨ 核心功能

### 📆 多视图日历展示

#### 月视图
- 整月日历展示，清晰显示日期分布
- 自定义日期渲染组件，同时显示公历和农历
- 农历信息包括：农历日期、干支纪年、生肖、节气
- 节假日高亮显示（红色标注）
- 当前月份日期正常显示，非当前月日期灰色透明显示
- 选中日期高亮（蓝色背景）
- 点击日期可快速跳转到对应月份
- 带事件标记（蓝点）提示

#### 周视图
- 显示一周七天的日期和星期
- 展示本周所有事件列表
- 支持周切换（前后翻周）
- 点击日期可快速定位到该天
- 当前选中日期高亮显示

#### 日视图
- 展示选定日期的详细事件列表
- 显示事件的时间范围（开始至结束时间）
- 跨天事件显示完整日期范围
- 空状态友好提示

### 📝 日程的增删改查（CRUD）

#### ✅ 添加日程
- **标题和描述**: 支持输入事件标题和详细描述
- **日期选择**: 可视化日期选择器，支持开始和结束日期
- **时间设置**: 精确到分钟的时间选择器
- **持续时间计算**: 自动计算并显示事件持续时间（小时和分钟）
- **农历信息显示**: 实时显示所选日期的农历信息（干支年、生肖、节气等）
- **节假日提示**: 自动识别并显示国际节日和中国传统节日
- **提醒设置**: 多种提醒选项（不提醒、立刻、5/15/30 分钟前、1/2 小时前、1 天前）
- **数据验证**: 自动验证结束时间必须在开始时间之后

#### ✏️ 编辑日程
- 回显原有事件的所有信息
- 支持修改标题、描述、日期、时间和提醒设置
- 显示原事件的农历和节假日信息
- 更新时自动取消旧通知并创建新通知
- 悬浮操作按钮（FAB）快速保存

#### 📋 查看日程
- 按日期筛选显示所有事件
- 事件卡片式展示，包含完整信息
- 显示农历日期和节假日信息
- 支持快速编辑和删除操作
- 空状态引导添加新事件
- 悬浮按钮快速添加事件

#### 🗑️ 删除日程
- 一键删除事件
- 自动取消关联的通知
- 删除后实时更新列表

### 🔔 智能通知系统

#### 通知类型
- **本地通知**: 基于设备本地的定时通知
- **后台任务**: 支持后台通知处理

#### 提醒策略
- **准时提醒**: 在事件开始时间发送通知
- **提前提醒**: 根据用户设置的提前时间（5 分钟至 1 天）发送提醒
- **立刻提醒**: 特殊处理，立即或在事件开始时通知
- **过期处理**: 如果提醒时间已过，立即发送过期通知告知用户

#### 通知通道（Android）
- **日程提醒通道**: 高优先级，用于正常提醒
- **已过期提醒通道**: 普通优先级，用于过期通知

#### 通知交互
- 点击通知可直接跳转到对应日期的事件列表页面
- 支持声音、震动提醒
- 通知数据携带跳转路由和日期参数

### 🏮 农历节假日系统

#### 农历转换功能
- 使用 `solarlunar` 库实现公农历转换
- 显示内容包括：
  - 农历月日（如"五月初五"）
  - 干支纪年（如"甲辰年"）
  - 生肖属相
  - 二十四节气（优先显示节气）
  - 闰月标识

#### 节假日识别
- **国际节日**（公历）:
  - 元旦、情人节、妇女节、劳动节、儿童节、国庆节等（共 13 个）
  
- **传统节日**（农历）:
  - 春节、元宵节、端午节、七夕节、中秋节、重阳节、腊八节、小年
  - 特殊处理：除夕（农历腊月最后一天）

#### 显示逻辑
- 节假日优先于农历日期显示
- 节日信息用红色标注，醒目易识别
- 在多个页面（日历、添加、编辑、查看）均显示农历和节假日信息

---

## 🏗️ 技术架构

### 技术栈

```
┌─────────────────────────────────────┐
│         应用层 (UI/Pages)           │
│  React Native + Expo                │
│  - CalendarScreen (月/周/日视图)     │
│  - AddEventScreen (添加日程)        │
│  - EditEventScreen (编辑日程)       │
│  - ViewScreen (查看日程)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       导航层 (React Navigation)     │
│  - Stack Navigator                  │
│  - 路由管理与页面跳转               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       业务逻辑层                     │
│  - database.js (SQLite 操作)         │
│  - notifications.js (通知管理)       │
│  - lunarCalculator.js (农历计算)    │
│  - holidays.js (节假日数据)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       数据持久化层                   │
│  - SQLite (expo-sqlite)             │
│  - events 表存储所有日程数据         │
└─────────────────────────────────────┘
```

### 关键技术选型

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **框架** | React Native | 0.81.4 | 跨平台 UI 框架 |
| **开发平台** | Expo | SDK 54 | 开发与构建工具链 |
| **语言** | JavaScript / TypeScript | 5.9.2 | 主要编程语言 |
| **导航** | React Navigation | v7 | 页面导航管理 |
| **数据库** | expo-sqlite | ~16.0.8 | 本地数据存储 |
| **日期处理** | dayjs | ^1.11.18 | 日期格式化与计算 |
| **农历转换** | solarlunar | ^2.0.7 | 公农历转换 |
| **通知** | expo-notifications | ~0.32.12 | 本地/推送通知 |
| **后台任务** | expo-task-manager | ^14.0.9 | 后台任务管理 |
| **UI 组件** | react-native-calendars | ^1.1313.0 | 日历组件 |
| **图标** | @expo/vector-icons | ^15.0.2 | 矢量图标库 |
| **渐变** | expo-linear-gradient | ^15.0.7 | 渐变背景效果 |

---

## 📂 项目结构

```
CalendarApp/
├── app/                        # 应用入口和导航配置
│   └── index.tsx              # 主入口，初始化数据库和通知
├── screens/                    # 页面级组件
│   ├── CalendarScreen.js      # 日历主页面（月/周/日视图）
│   ├── AddEventScreen.js      # 添加日程页面
│   ├── EditEventScreen.js     # 编辑日程页面
│   └── ViewScreen.js          # 查看日程页面
├── components/                 # 可复用组件
│   └── WeekView.js            # 周视图组件
├── db/                         # 数据库模块
│   └── database.js            # SQLite 数据库操作
├── utils/                      # 工具函数
│   ├── notifications.js       # 通知管理
│   ├── lunarCalculator.js     # 农历计算
│   └── holidays.js            # 节假日数据
├── constants/                  # 常量定义
│   └── theme.ts               # 主题样式
├── hooks/                      # 自定义 Hooks
│   ├── use-color-scheme.ts    # 颜色主题 Hook
│   └── use-theme-color.ts     # 主题色 Hook
├── package.json                # 项目依赖配置
├── tsconfig.json               # TypeScript 配置
├── app.json                    # Expo 应用配置
└── eas.json                    # EAS Build 配置
```

---

## 💾 数据库设计

### events 表结构

```sql
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,           -- 事件标题
  description TEXT,              -- 事件描述
  date TEXT NOT NULL,            -- 开始日期 (YYYY-MM-DD)
  endDate TEXT,                  -- 结束日期
  startTime TEXT NOT NULL,       -- 开始时间 (HH:mm)
  endTime TEXT NOT NULL,         -- 结束时间
  reminder INTEGER,              -- 提前提醒时间（分钟）
  notificationId TEXT            -- 关联的通知 ID
);
```

### 数据库操作流程

```javascript
// 添加事件
addEvent(event) → 创建通知 → 保存到数据库

// 查询事件
getEvents(date) → 按日期筛选 → 返回事件列表
getEventsByDateRange(startDate, endDate) → 按范围查询

// 更新事件
updateEvent(id, eventData) → 取消旧通知 → 创建新通知 → 更新数据库

// 删除事件
deleteEvent(id) → 取消通知 → 删除数据库记录
```

---

## 🔔 通知系统实现详解

### 系统架构

```
┌─────────────────────────────────────┐
│         应用层 (App Entry)          │
│  - 初始化通知权限                    │
│  - 注册后台任务                      │
│  - 设置通知响应处理器                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      工具层 (notifications.js)      │
│  - 通知通道配置 (Android)            │
│  - 权限请求                          │
│  - 本地通知安排                      │
│  - 推送通知安排                      │
│  - 通知取消                          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      数据层 (database.js)           │
│  - 添加事件时创建通知                │
│  - 更新事件时重新安排通知            │
│  - 删除事件时取消通知                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Expo Notifications API            │
│   (系统级通知服务)                   │
└─────────────────────────────────────┘
```

### 通知生命周期

```
创建事件 (addEvent)
    ↓
安排通知 (scheduleLocalNotification)
    ↓
获得 notificationId
    ↓
保存到数据库 (events.notificationId)
    ↓
到达触发时间 → 系统显示通知
    ↓
用户点击通知 → 跳转到详情页
```

### 智能提醒策略

```javascript
// 1. 立刻提醒 (reminder = 0)
if (event.reminder === 0) {
  if (triggerTime < now) {
    // 时间已过 → 立即发送过期通知
  } else {
    // 安排在开始时间发送
  }
}

// 2. 不提醒 (reminder = -1)
if (!event.reminder || event.reminder < 0) return null;

// 3. 提前提醒 (正常情况)
const reminderTime = startTime - reminderMinutes;
if (reminderTime < now) {
  // 提醒时间已过 → 立即发送过期通知
} else {
  // 安排定时通知
}
```

### Android 通知通道

```javascript
// 通道 1: 日程提醒（高优先级）
'calendar-reminders': {
  importance: HIGH,
  vibrationPattern: [0, 250, 250, 250],
  bypassDnd: true
}

// 通道 2: 已过期提醒（普通优先级）
'expired-reminders': {
  importance: DEFAULT
}
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 16.x
- **npm**: >= 8.x
- **Expo CLI**: 通过 npx 自动调用
- **Android Studio / Xcode** (可选，用于真机调试)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd CalendarApp
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm start
```

4. **运行到不同平台**

```bash
# Android
npm run android

#PS 尚未对其他平台做适配，暂不支持web和ios端
# iOS
npm run ios

# Web
npm run web
```

---

## 🛠️ 开发命令

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 Expo 开发服务器 |
| `npm run android` | 在 Android 设备/模拟器上运行 |
| `npm run ios` | 在 iOS 设备/模拟器上运行 |
| `npm run web` | 在浏览器中运行 |
| `npm run lint` | 代码检查 |
| `npm run reset-project` | 重置项目到初始状态 |

---

## 🎨 UI/UX 设计特色

### 配色方案
- **主色调**: 蓝色系 (#42a5f5, #2196F3, #1976d2)
- **渐变背景**: 从浅蓝到白色的柔和过渡
- **强调色**: 红色用于节假日标注

### 交互体验
- 流畅的页面切换动画
- 直观的图标和按钮设计
- 友好的空状态提示
- 实时反馈的操作结果
- 响应式布局适配不同屏幕

### 视觉层次
- 卡片式设计区分内容区块
- 阴影效果增强立体感
- 渐变色提升视觉美感
- 清晰的字体层级和间距

---

## 📱 适用场景

- ✅ 个人日常事务管理
- ✅ 工作会议安排
- ✅ 重要日期提醒（生日、纪念日等）
- ✅ 节假日规划
- ✅ 传统农历日期查询

---

## ⚠️ 已知限制

### 远程推送通知
- 代码中已实现通过 Expo Push Notifications 的远程推送通知功能
- 但由于网络原因，目前暂时未启用
- 当前仅使用本地通知（Local Notifications）
- 远程推送功能需要 Expo 服务器支持，国内访问可能不稳定

### Web 平台兼容性
- 部分原生模块在 Web 平台可能兼容性有限
- 如：haptics（触觉反馈）、notifications（通知）等
- 建议使用原生平台（iOS/Android）获得完整体验

---

## 🔧 配置说明

### app.json - Expo 应用配置

```json
{
  "expo": {
    "name": "CalendarApp",
    "slug": "calendar-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android", "web"],
    "plugins": [
      "expo-notifications",
      "expo-sqlite"
    ]
  }
}
```

### eas.json - EAS Build 配置

```json
{
  "cli": {
    "version": ">= 0.52.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

---

## 📝 代码规范

### ESLint 配置
项目使用 ESLint 进行代码质量检查，遵循 `eslint-config-expo` 规范。

配置文件：`eslint.config.js`

### TypeScript 规范
- 启用 strict 模式
- 推荐使用类型注解
- 避免使用 `any` 类型

### 图标使用规范
- 统一使用 MaterialIcons 图标库
- 通过 `react-native-vector-icons/MaterialIcons` 导入
- 保持各页面返回按钮风格一致

### 安全区域适配
- 使用 `SafeAreaView` 包裹根容器
- 确保内容避开状态栏、刘海屏等区域
- 自动适配不同设备的安全区域

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🙏 致谢

感谢以下开源项目：

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [react-native-calendars](https://github.com/wix/react-native-calendars)
- [solarlunar](https://www.npmjs.com/package/solarlunar)
- [dayjs](https://day.js.org/)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star 支持一下！⭐**


</div>
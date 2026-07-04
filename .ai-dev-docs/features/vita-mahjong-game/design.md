# 技术设计文档 - Vita Mahjong H5 小游戏

## 初始设计 - 2026-07-04

---

## 1. 架构概览

### 1.1 技术栈选型

| 层面 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | React 18 + TypeScript | 题目要求使用 React |
| 构建 | Vite 5 | 快速构建，HMR 热更新 |
| 路由 | React Router v6 | 页面导航（主页/游戏/结算） |
| 状态管理 | React Context + useReducer | 轻量级，无需引入第三方库 |
| 样式方案 | CSS Modules + CSS Variables | 主题化，移动端适配 |
| 动画 | CSS Animations + requestAnimationFrame | 消除动画、连击特效 |
| 持久化 | localStorage | 关卡进度、最高分保存 |
| 部署 | 静态 HTML 文件 | 可直接手机浏览器打开 |

### 1.2 项目结构

```
vita-mahjong/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── favicon.ico
└── src/
    ├── main.tsx                    # 应用入口
    ├── App.tsx                     # 根组件 + 路由配置
    ├── types/
    │   └── index.ts               # 全局类型定义
    ├── constants/
    │   ├── tiles.ts               # 麻将牌定义（图案、分类）
    │   └── levels.ts              # 关卡数据（20+ 关卡布局）
    ├── utils/
    │   ├── gameLogic.ts           # 核心游戏逻辑（自由牌判定、槽位配对、连锁消除）
    │   ├── levelGenerator.ts      # 关卡生成器（基于模板 + 随机化）
    │   ├── storage.ts             # localStorage 封装
    │   └── shuffle.ts             # 洗牌算法
    ├── hooks/
    │   ├── useGameState.ts        # 游戏状态管理 Hook
    │   └── useTimer.ts            # 计时器 Hook
    ├── context/
    │   └── GameContext.tsx         # 游戏全局上下文
    ├── components/
    │   ├── Tile/
    │   │   ├── Tile.tsx           # 单张麻将牌组件
    │   │   └── Tile.module.css
    │   ├── TileBoard/
    │   │   ├── TileBoard.tsx      # 牌面棋盘组件
    │   │   └── TileBoard.module.css
    │   ├── SlotBar/
    │   │   ├── SlotBar.tsx        # 槽位栏组件（新增）
    │   │   └── SlotBar.module.css
    │   ├── ScoreBar/
    │   │   ├── ScoreBar.tsx       # 顶部得分栏
    │   │   └── ScoreBar.module.css
    │   ├── ToolBar/
    │   │   ├── ToolBar.tsx        # 底部工具栏（提示/洗牌/撤回）
    │   │   └── ToolBar.module.css
    │   └── StarRating/
    │       ├── StarRating.tsx     # 星级评价组件
    │       └── StarRating.module.css
    ├── pages/
    │   ├── HomePage/
    │   │   ├── HomePage.tsx       # 主页
    │   │   └── HomePage.module.css
    │   ├── GamePage/
    │   │   ├── GamePage.tsx       # 游戏页
    │   │   └── GamePage.module.css
    │   └── ResultPage/
    │       ├── ResultPage.tsx     # 结算页
    │       └── ResultPage.module.css
    └── styles/
        ├── global.css             # 全局样式
        ├── variables.css          # CSS 变量（主题色、尺寸）
        └── animations.css         # 动画定义
```

---

## 2. 核心数据模型

### 2.1 麻将牌类型定义

```typescript
// 牌的种类
type TileSuit = 'wan' | 'tiao' | 'tong' | 'feng' | 'jian' | 'animal';

// 单张牌的定义
interface TileType {
  id: string;           // 唯一标识，如 "wan_1", "feng_dong"
  suit: TileSuit;       // 花色
  value: number | string; // 数值或名称
  label: string;        // 显示文本（如 "一万"、"东"）
  emoji: string;        // Emoji 或 SVG 图标
}

// 棋盘上的一张牌实例
interface TileInstance {
  uid: string;          // 实例唯一 ID（同一种牌可有多张）
  typeId: string;       // 对应 TileType.id
  row: number;          // 行位置（网格坐标）
  col: number;          // 列位置（网格坐标）
  layer: number;        // 层级（0 为最底层）
  isRemoved: boolean;   // 是否已被移除（移入槽位或已消除）
  isFree: boolean;      // 是否为自由牌（动态计算）
}

// 槽位栏中的牌
interface SlotTile {
  uid: string;          // 来源牌的 uid（撒回时用于定位原位置）
  typeId: string;       // 牌的类型 ID
  originalPosition: {   // 原始位置（撤回时恢复用）
    row: number;
    col: number;
    layer: number;
  };
}
```

### 2.2 关卡数据模型

```typescript
// 关卡布局模板
interface LevelLayout {
  id: number;           // 关卡编号
  name: string;         // 关卡名称
  rows: number;         // 网格行数
  cols: number;         // 网格列数
  layers: number;       // 最大层数
  // 布局数据：每个位置标记 [row, col, layer]
  positions: [number, number, number][];
  tileCount: number;    // 总牌数（必须是偶数）
  slotCapacity: number; // 槽位容量（默认 4）
  hintCount: number;    // 初始提示次数
  shuffleCount: number; // 初始洗牌次数
  undoCount: number;    // 初始撤回次数
}

// 关卡进度
interface LevelProgress {
  levelId: number;
  completed: boolean;
  bestScore: number;
  bestTime: number;
  stars: number;        // 1-3 星
}
```

### 2.3 游戏状态模型

```typescript
interface GameState {
  // 关卡信息
  currentLevel: number;
  levelData: LevelLayout;

  // 牌面状态
  tiles: TileInstance[];

  // 槽位状态（核心新增）
  slotTiles: SlotTile[];       // 槽位中的牌（最多 4 张）
  slotCapacity: number;        // 槽位容量（默认 4）

  // 计分
  score: number;
  matchCount: number;
  comboCount: number;
  lastMatchTime: number;

  // 道具
  hintRemaining: number;
  shuffleRemaining: number;
  undoRemaining: number;       // 撤回次数（新增）

  // 计时
  elapsedTime: number;
  isTimerRunning: boolean;

  // 游戏状态
  status: 'playing' | 'won' | 'lost' | 'paused';
}

type GameAction =
  | { type: 'PICK_TILE'; tile: TileInstance }  // 用户点击自由牌，移入槽位
  | { type: 'SLOT_MATCH' }                     // 槽位内最右两张配对消除
  | { type: 'SLOT_FULL' }                      // 槽位已满，游戏失败
  | { type: 'USE_HINT' }
  | { type: 'USE_SHUFFLE' }
  | { type: 'USE_UNDO' }                       // 撤回槽位最后一张牌
  | { type: 'TICK_TIMER' }
  | { type: 'GAME_WON' }
  | { type: 'GAME_LOST' }
  | { type: 'RESTART_LEVEL' }
  | { type: 'INIT_LEVEL'; level: LevelLayout; tiles: TileInstance[] };
```

---

## 3. 核心算法设计

### 3.1 自由牌判定算法

```
function isTileFree(tile, allTiles):
    // 条件 1：上方没有牌覆盖
    for each otherTile in allTiles:
        if otherTile.isRemoved: continue
        if otherTile.layer > tile.layer:
            if hasOverlap(tile, otherTile):
                return false  // 被上层牌覆盖

    // 条件 2：左侧或右侧至少一侧空出
    leftBlocked = false
    rightBlocked = false
    for each otherTile in allTiles:
        if otherTile.isRemoved: continue
        if otherTile.layer == tile.layer:
            if otherTile.col == tile.col - 1 and rowOverlap(tile, otherTile):
                leftBlocked = true
            if otherTile.col == tile.col + 1 and rowOverlap(tile, otherTile):
                rightBlocked = true

    return !(leftBlocked && rightBlocked)
```

关键点：牌占据的区域是一个矩形（通常 2x2 网格单元），判定"覆盖"需要检查矩形是否有交集。

### 3.2 关卡生成算法（逆向放置法）

为确保每个关卡都有解，采用"从空棋盘逆向放牌"的方式生成：

```
function generateSolvableLevel(layout):
    positions = layout.positions  // 所有合法位置
    tileCount = positions.length  // 必须是偶数
    pairCount = tileCount / 2

    // 1. 生成足够的牌对
    tilePairs = selectRandomTilePairs(pairCount)

    // 2. 从顶层开始，逆向放置
    //    按层级从高到低排列位置
    sortedPositions = sortByLayerDescending(positions)

    // 3. 逐对放置：每对牌放在两个当前"自由"的位置上
    placedTiles = []
    for each pair in tilePairs:
        freePositions = getFreePositions(sortedPositions, placedTiles)
        pos1 = pickRandom(freePositions)
        freePositions.remove(pos1)
        pos2 = pickRandom(freePositions)
        placeTile(pair[0], pos1)
        placeTile(pair[1], pos2)

    return placedTiles
```

### 3.3 洗牌算法（保证可解）

```
function shuffleTiles(remainingTiles):
    // 1. 收集所有剩余牌的类型
    types = remainingTiles.map(t => t.typeId)

    // 2. 随机打乱类型
    shuffledTypes = fisherYatesShuffle(types)

    // 3. 将打乱后的类型重新分配到原有位置
    for i in range(remainingTiles.length):
        remainingTiles[i].typeId = shuffledTypes[i]

    // 4. 重新计算自由牌状态
    recalculateFreeTiles(remainingTiles)
```

### 3.4 槽位配对算法

```
function onTileEnterSlot(newTile, slotTiles):
    // 在槽位中查找与新牌图案相同的任意一张
    matchIndex = -1
    for i in range(slotTiles.length):
        if slotTiles[i].typeId == newTile.typeId:
            matchIndex = i
            break

    if matchIndex >= 0:
        // 找到匹配，消除槽位中的那张，新牌也不入槽
        slotTiles.splice(matchIndex, 1)
        score += calculateScore(comboCount)
        comboCount++
        matchCount++
    else:
        // 没找到匹配，新牌入槽
        slotTiles.push(newTile)

    // 检查槽位是否已满
    if slotTiles.length >= slotCapacity:
        return 'GAME_LOST'

    // 检查牌面是否清空
    if allTilesRemoved && slotTiles.length == 0:
        return 'GAME_WON'

    return 'CONTINUE'
```

### 3.5 撤回算法

```
function undoLastSlotTile(slotTiles, boardTiles):
    if slotTiles.length == 0: return false

    lastTile = slotTiles.pop()
    // 将牌恢复到牌面原位置
    originalTile = findTileByUid(boardTiles, lastTile.uid)
    originalTile.isRemoved = false
    // 重新计算自由牌状态
    recalculateFreeTiles(boardTiles)
    return true
```

---

## 4. 组件设计

### 4.1 页面路由

```
/ (HomePage)        → 游戏主页
/game/:levelId     → 游戏界面
/result/:levelId   → 结算界面
```

### 4.2 组件层级

```
App
├── HomePage
│   ├── Logo
│   ├── LevelButton (当前关卡)
│   └── LevelProgress (进度指示)
│
├── GamePage
│   ├── ScoreBar (关卡号/分数/匹配数)
│   ├── TileBoard
│   │   └── Tile × N (每张麻将牌)
│   ├── SlotBar (槽位栏，4 个槽位)       ← 新增核心组件
│   │   └── SlotTile × 0~4 (槽位中的牌)
│   └── ToolBar (提示/洗牌/撤回按钮)
│
└── ResultPage
    ├── StarRating (星级评价)
    ├── ScoreSummary (得分/用时/匹配数)
    └── ActionButtons (下一关/重玩/回主页)
```

### 4.3 TileBoard 渲染策略

牌面采用绝对定位 + CSS transform 渲染，每张牌基于其 `(row, col, layer)` 计算屏幕位置：

```
tileX = col * TILE_WIDTH * 0.5  // 半格偏移，支持交错排列
tileY = row * TILE_HEIGHT * 0.5
tileZ = layer * LAYER_OFFSET    // 层级偏移，产生立体感

// CSS
transform: translate(tileX, tileY)
z-index: layer * 10
// 上层牌添加阴影增加立体感
box-shadow: 2px 2px 4px rgba(0,0,0,0.3)
```

---

## 5. 麻将牌面设计方案

### 5.1 牌面图案方案

采用 **CSS + Unicode/Emoji** 混合方案，确保无需加载图片资源：

| 类别 | 牌面 | 显示方案 |
|------|------|---------|
| 万字牌 | 一万~九万 | CSS 绘制汉字数字 + "万" |
| 条子牌 | 一条~九条 | CSS 绘制竹节图案 |
| 筒子牌 | 一筒~九筒 | CSS 绘制圆形图案 |
| 风牌 | 东南西北 | CSS 绘制汉字 |
| 箭牌 | 中发白 | CSS 绘制（红色中、绿色发、白板） |

### 5.2 牌面尺寸

- 基准尺寸：60px × 80px（在 375px 宽度屏幕上）
- 使用 `vw` 单位实现响应式缩放
- 最小触摸热区：44px × 44px

---

## 6. 关卡设计方案

### 6.1 难度递进策略

| 关卡范围 | 牌数 | 层数 | 特点 |
|---------|------|------|------|
| 1-5 | 24-36 | 2 | 入门级，布局简单，牌种少 |
| 6-10 | 36-48 | 2-3 | 进阶级，引入更多牌种 |
| 11-15 | 48-64 | 3-4 | 挑战级，布局更复杂 |
| 16-20 | 64-80 | 3-5 | 专家级，深层堆叠，大棋盘 |

### 6.2 布局模板

预设 5 种基础布局模板，每种模板在不同关卡中旋转/变体使用：

1. **金字塔型 (Pyramid)**：底宽顶窄
2. **龟壳型 (Turtle)**：经典麻将接龙布局
3. **十字型 (Cross)**：中心密集，四方延伸
4. **菱形型 (Diamond)**：对角线对称
5. **桥型 (Bridge)**：两端连接

---

## 7. 移动端适配策略

### 7.1 视口配置

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0,
  maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

### 7.2 布局策略

- 游戏区域使用 `100dvh`（动态视口高度）避免被地址栏遮挡
- 牌面缩放基于屏幕宽度动态计算
- 安全区域适配（iPhone 刘海/底部横条）

### 7.3 交互优化

- 禁用双指缩放（游戏场景）
- 禁用长按菜单
- 使用 `touch-action: manipulation` 消除 300ms 延迟
- 点击牌面时添加触觉反馈（vibrate API，如果支持）

---

## 8. 数据流设计

```
用户点击牌面上的自由牌
    ↓
GamePage 捕获点击事件
    ↓
dispatch({ type: 'PICK_TILE', tile })
    ↓
gameReducer 处理 PICK_TILE：
    1. 牌面上该牌标记 isRemoved = true
    2. 重新计算牌面上所有牌的 isFree 状态
    3. 创建 SlotTile，加入 slotTiles 数组末尾
    ↓
槽位配对检测：
    4. 扫描 slotTiles 中所有牌，找与新牌图案相同的任意一张
       - 找到 → 消除槽位中的那张 + 新牌不入槽，分数 +100×combo
       - 未找到 → 新牌正常入槽
    ↓
结果判定：
    5. 如果牌面清空且槽位清空 → dispatch GAME_WON
    6. 如果槽位已满（= slotCapacity） → dispatch GAME_LOST
    7. 否则继续游戏
    ↓
状态更新触发 React 重渲染

用户点击"撤回"按钮
    ↓
dispatch({ type: 'USE_UNDO' })
    ↓
gameReducer 处理 USE_UNDO：
    1. 从 slotTiles 取出最后一张牌
    2. 将其恢复到牌面上的原始位置（isRemoved = false）
    3. 重新计算自由牌状态
    4. undoRemaining - 1
```

---

## 9. 性能优化策略

### 9.1 渲染优化

- 使用 `React.memo` 包裹 Tile 组件，避免无关牌的重渲染
- 自由牌状态变化时才重新计算，使用 `useMemo` 缓存
- 动画使用 CSS transform + opacity，触发 GPU 加速

### 9.2 内存优化

- 关卡数据按需加载（不一次性加载所有关卡）
- 消除动画结束后从 DOM 移除已消除的牌

---

## 10. 错误处理策略

| 场景 | 处理方式 |
|------|---------|
| localStorage 不可用 | 降级为内存存储，关闭后丢失进度 |
| 关卡生成失败 | 重试 3 次，仍失败则使用预设固定布局 |
| 触摸事件异常 | 重置选中状态 |

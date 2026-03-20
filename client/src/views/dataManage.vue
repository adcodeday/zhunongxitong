<template>
  <div class="dashboard">
    <!-- 顶部标题区 -->
    <div class="dash-header">
      <div class="header-left">
        <div class="header-badge">数据总览</div>
        <h1 class="header-title">智慧助农电商平台</h1>
        <p class="header-sub">2025 年度运营数据统计</p>
      </div>
      <div class="header-right">
        <div class="live-dot"></div>
        <span class="live-text">实时更新</span>
        <span class="update-time">最后更新：2025-07-18 14:30</span>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="kpi-row">
      <div class="kpi-card kpi-1">
        <div class="kpi-icon">💰</div>
        <div class="kpi-body">
          <div class="kpi-label">年度总收入</div>
          <div class="kpi-value">¥<span class="kpi-num">284.7</span><span class="kpi-unit">万</span></div>
          <div class="kpi-trend up">▲ 18.3% 同比增长</div>
        </div>
        <svg class="kpi-spark" viewBox="0 0 80 32"><polyline points="0,28 10,22 20,25 30,14 40,18 50,8 60,12 70,4 80,6" fill="none" stroke="currentColor" stroke-width="2"/></svg>
      </div>
      <div class="kpi-card kpi-2">
        <div class="kpi-icon">📦</div>
        <div class="kpi-body">
          <div class="kpi-label">累计订单数</div>
          <div class="kpi-value"><span class="kpi-num">12,856</span><span class="kpi-unit">单</span></div>
          <div class="kpi-trend up">▲ 24.1% 同比增长</div>
        </div>
        <svg class="kpi-spark" viewBox="0 0 80 32"><polyline points="0,26 10,20 20,22 30,12 40,16 50,6 60,10 70,2 80,4" fill="none" stroke="currentColor" stroke-width="2"/></svg>
      </div>
      <div class="kpi-card kpi-3">
        <div class="kpi-icon">👥</div>
        <div class="kpi-body">
          <div class="kpi-label">注册用户数</div>
          <div class="kpi-value"><span class="kpi-num">3,420</span><span class="kpi-unit">人</span></div>
          <div class="kpi-trend up">▲ 32.7% 同比增长</div>
        </div>
        <svg class="kpi-spark" viewBox="0 0 80 32"><polyline points="0,30 10,26 20,28 30,18 40,20 50,10 60,14 70,6 80,8" fill="none" stroke="currentColor" stroke-width="2"/></svg>
      </div>
      <div class="kpi-card kpi-4">
        <div class="kpi-icon">🌾</div>
        <div class="kpi-body">
          <div class="kpi-label">在售农产品</div>
          <div class="kpi-value"><span class="kpi-num">286</span><span class="kpi-unit">种</span></div>
          <div class="kpi-trend up">▲ 15.2% 同比增长</div>
        </div>
        <svg class="kpi-spark" viewBox="0 0 80 32"><polyline points="0,24 10,20 20,22 30,14 40,16 50,8 60,10 70,4 80,6" fill="none" stroke="currentColor" stroke-width="2"/></svg>
      </div>
      <div class="kpi-card kpi-5">
        <div class="kpi-icon">✅</div>
        <div class="kpi-body">
          <div class="kpi-label">任务完成率</div>
          <div class="kpi-value"><span class="kpi-num">89.4</span><span class="kpi-unit">%</span></div>
          <div class="kpi-trend down">▼ 2.1% 较上月</div>
        </div>
        <svg class="kpi-spark" viewBox="0 0 80 32"><polyline points="0,10 10,14 20,12 30,18 40,16 50,20 60,18 70,22 80,24" fill="none" stroke="currentColor" stroke-width="2"/></svg>
      </div>
    </div>

    <!-- 中间区：月度趋势 + 分类占比 -->
    <div class="mid-row">
      <!-- 月度销售趋势 -->
      <div class="chart-card chart-wide">
        <div class="card-header">
          <span class="card-title">月度销售趋势</span>
          <div class="legend-row">
            <span class="legend-item"><em class="dot dot-green"></em>销售额(万元)</span>
            <span class="legend-item"><em class="dot dot-orange"></em>订单量</span>
          </div>
        </div>
        <div class="bar-chart-wrap">
          <div class="y-axis">
            <span>60</span><span>45</span><span>30</span><span>15</span><span>0</span>
          </div>
          <div class="bars-area">
            <div class="bar-group" v-for="(item, i) in monthData" :key="i">
              <div class="bar-pair">
                <div class="bar bar-green" :style="{ height: (item.sales / 60 * 140) + 'px' }" :title="'销售额：¥' + item.sales + '万'">
                  <span class="bar-tip">{{ item.sales }}</span>
                </div>
                <div class="bar bar-orange" :style="{ height: (item.orders / 1400 * 140) + 'px' }" :title="'订单量：' + item.orders">
                  <span class="bar-tip">{{ item.orders }}</span>
                </div>
              </div>
              <span class="bar-label">{{ item.month }}</span>
            </div>
            <!-- 网格线 -->
            <div class="grid-lines">
              <div class="grid-line" v-for="n in 4" :key="n"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 品类占比 -->
      <div class="chart-card chart-narrow">
        <div class="card-header">
          <span class="card-title">品类销售占比</span>
        </div>
        <div class="donut-wrap">
          <svg class="donut-svg" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="70" fill="none" stroke="#f0f4f0" stroke-width="28"/>
            <circle cx="100" cy="100" r="70" fill="none" stroke="#42b983" stroke-width="28"
              stroke-dasharray="131.9 307.9" stroke-dashoffset="0" class="donut-seg"/>
            <circle cx="100" cy="100" r="70" fill="none" stroke="#73d9a8" stroke-width="28"
              stroke-dasharray="86.7 353.1" stroke-dashoffset="-131.9" class="donut-seg"/>
            <circle cx="100" cy="100" r="70" fill="none" stroke="#f5a623" stroke-width="28"
              stroke-dasharray="61.5 378.3" stroke-dashoffset="-218.6" class="donut-seg"/>
            <circle cx="100" cy="100" r="70" fill="none" stroke="#e85d5d" stroke-width="28"
              stroke-dasharray="43.9 396.0" stroke-dashoffset="-280.1" class="donut-seg"/>
            <circle cx="100" cy="100" r="70" fill="none" stroke="#6c9eff" stroke-width="28"
              stroke-dasharray="15.7 424.1" stroke-dashoffset="-324.0" class="donut-seg"/>
            <text x="100" y="95" text-anchor="middle" class="donut-center-val">43%</text>
            <text x="100" y="115" text-anchor="middle" class="donut-center-label">蔬菜水果</text>
          </svg>
        </div>
        <div class="donut-legend">
          <div class="dl-item" v-for="cat in categories" :key="cat.name">
            <span class="dl-dot" :style="{ background: cat.color }"></span>
            <span class="dl-name">{{ cat.name }}</span>
            <span class="dl-pct">{{ cat.pct }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 下方区：排行榜 + 地区 + 任务状态 -->
    <div class="bot-row">
      <!-- 热销产品排行 -->
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">🏆 热销产品 TOP 10</span>
        </div>
        <div class="rank-list">
          <div class="rank-item" v-for="(p, i) in topProducts" :key="i">
            <span class="rank-no" :class="['rank-' + (i+1)]">{{ i + 1 }}</span>
            <span class="rank-name">{{ p.name }}</span>
            <div class="rank-bar-wrap">
              <div class="rank-bar" :style="{ width: (p.sales / topProducts[0].sales * 100) + '%', background: rankColor(i) }"></div>
            </div>
            <span class="rank-val">{{ p.sales }}件</span>
          </div>
        </div>
      </div>

      <!-- 地区分布 -->
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">📍 地区销售分布</span>
        </div>
        <div class="region-list">
          <div class="region-item" v-for="r in regions" :key="r.name">
            <div class="region-top">
              <span class="region-name">{{ r.name }}</span>
              <span class="region-amt">¥{{ r.amount }}万</span>
            </div>
            <div class="region-bar-bg">
              <div class="region-bar-fill" :style="{ width: (r.amount / regions[0].amount * 100) + '%' }"></div>
            </div>
            <span class="region-pct">占比 {{ r.pct }}%</span>
          </div>
        </div>
      </div>

      <!-- 任务状态 + 用户构成 -->
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">📋 任务状态分布</span>
        </div>
        <div class="task-stats">
          <div class="task-item" v-for="t in taskStatus" :key="t.label">
            <div class="task-circle" :style="{ background: t.color }">
              <span class="task-num">{{ t.count }}</span>
            </div>
            <span class="task-label">{{ t.label }}</span>
          </div>
        </div>
        <div class="divider"></div>
        <div class="card-header" style="margin-top:12px">
          <span class="card-title">👤 用户构成</span>
        </div>
        <div class="user-composition">
          <div class="uc-bar">
            <div class="uc-seg" v-for="u in userComp" :key="u.label" :style="{ width: u.pct + '%', background: u.color }" :title="u.label + ': ' + u.pct + '%'"></div>
          </div>
          <div class="uc-legend">
            <span v-for="u in userComp" :key="u.label" class="uc-item">
              <em :style="{ background: u.color }"></em>{{ u.label }} {{ u.pct }}%
            </span>
          </div>
        </div>
        <div class="divider"></div>
        <div class="card-header" style="margin-top:12px">
          <span class="card-title">⭐ 平均评分</span>
        </div>
        <div class="rating-row">
          <div class="rating-big">4.8</div>
          <div class="stars">★★★★★</div>
          <div class="rating-sub">基于 8,234 条评价</div>
        </div>
      </div>
    </div>

    <!-- 底部：近7日订单走势 -->
    <div class="bot2-row">
      <div class="chart-card chart-full">
        <div class="card-header">
          <span class="card-title">近 7 日订单与收入走势</span>
          <div class="legend-row">
            <span class="legend-item"><em class="dot dot-green"></em>订单数</span>
            <span class="legend-item"><em class="dot dot-blue"></em>收入(元)</span>
          </div>
        </div>
        <div class="line-chart-wrap">
          <svg class="line-svg" viewBox="0 0 700 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#42b983" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#42b983" stop-opacity="0"/>
              </linearGradient>
              <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6c9eff" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#6c9eff" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <!-- 订单线 -->
            <path :d="orderPath.area" fill="url(#grad1)"/>
            <path :d="orderPath.line" fill="none" stroke="#42b983" stroke-width="2.5" stroke-linejoin="round"/>
            <!-- 收入线 -->
            <path :d="revPath.area" fill="url(#grad2)"/>
            <path :d="revPath.line" fill="none" stroke="#6c9eff" stroke-width="2.5" stroke-linejoin="round"/>
            <!-- 数据点 -->
            <circle v-for="(pt, i) in orderPoints" :key="'o'+i" :cx="pt.x" :cy="pt.y" r="4" fill="#42b983" stroke="white" stroke-width="1.5"/>
            <circle v-for="(pt, i) in revPoints" :key="'r'+i" :cx="pt.x" :cy="pt.y" r="4" fill="#6c9eff" stroke="white" stroke-width="1.5"/>
          </svg>
          <div class="line-x-labels">
            <span v-for="d in week7" :key="d">{{ d }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 月度数据
const monthData = [
  { month: '1月', sales: 18, orders: 420 },
  { month: '2月', sales: 22, orders: 510 },
  { month: '3月', sales: 28, orders: 640 },
  { month: '4月', sales: 35, orders: 820 },
  { month: '5月', sales: 42, orders: 980 },
  { month: '6月', sales: 38, orders: 880 },
  { month: '7月', sales: 55, orders: 1280 },
  { month: '8月', sales: 48, orders: 1100 },
  { month: '9月', sales: 52, orders: 1200 },
  { month: '10月', sales: 46, orders: 1060 },
  { month: '11月', sales: 58, orders: 1350 },
  { month: '12月', sales: 62, orders: 1420 },
]

// 品类
const categories = [
  { name: '蔬菜水果', pct: 43, color: '#42b983' },
  { name: '粮油谷物', pct: 28, color: '#73d9a8' },
  { name: '禽蛋水产', pct: 20, color: '#f5a623' },
  { name: '坚果干货', pct: 14, color: '#e85d5d' },
  { name: '茶叶特产', pct: 5, color: '#6c9eff' },
]

// 热销产品
const topProducts = [
  { name: '新鲜草莓', sales: 3280 },
  { name: '有机菠菜', sales: 2960 },
  { name: '农家土鸡蛋', sales: 2740 },
  { name: '黑木耳', sales: 2510 },
  { name: '红富士苹果', sales: 2380 },
  { name: '湖北莲藕', sales: 2100 },
  { name: '东北大米', sales: 1960 },
  { name: '云南蜂蜜', sales: 1820 },
  { name: '板栗', sales: 1640 },
  { name: '普洱茶叶', sales: 1480 },
]

const rankColor = (i) => {
  const colors = ['#f5a623', '#42b983', '#6c9eff', '#73d9a8', '#e85d5d']
  return colors[i % colors.length]
}

// 地区
const regions = [
  { name: '华东地区', amount: 89.2, pct: 31.3 },
  { name: '华南地区', amount: 72.4, pct: 25.4 },
  { name: '华北地区', amount: 54.8, pct: 19.3 },
  { name: '华中地区', amount: 38.6, pct: 13.6 },
  { name: '西南地区', amount: 18.2, pct: 6.4 },
  { name: '其他地区', amount: 11.5, pct: 4.0 },
]

// 任务状态
const taskStatus = [
  { label: '进行中', count: 38, color: '#42b983' },
  { label: '已完成', count: 142, color: '#6c9eff' },
  { label: '待审核', count: 24, color: '#f5a623' },
  { label: '已下架', count: 18, color: '#e85d5d' },
]

// 用户构成
const userComp = [
  { label: '客户', pct: 58, color: '#42b983' },
  { label: '农户', pct: 32, color: '#6c9eff' },
  { label: '管理员', pct: 10, color: '#f5a623' },
]

// 近7日
const week7 = ['7/12', '7/13', '7/14', '7/15', '7/16', '7/17', '7/18']
const orders7 = [320, 480, 390, 560, 620, 510, 740]
const rev7 = [12400, 18600, 15200, 21800, 24100, 19800, 28700]

const mkPath = (vals, maxVal, H = 100, W = 700) => {
  const pts = vals.map((v, i) => ({
    x: i * (W / (vals.length - 1)),
    y: H - (v / maxVal) * H + 10
  }))
  const line = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')
  const area = line + ` L${pts[pts.length-1].x},${H+10} L0,${H+10} Z`
  return { line, area, pts }
}

const orderPath = computed(() => mkPath(orders7, Math.max(...orders7) * 1.1))
const revPath = computed(() => mkPath(rev7, Math.max(...rev7) * 1.1))
const orderPoints = computed(() => orderPath.value.pts)
const revPoints = computed(() => revPath.value.pts)
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }

.dashboard {
  margin-top: -20px;
  margin-left: -5vw;
  margin-right: -5vw;
  padding: 24px 5vw 40px;
  width: 100vw;
  max-width: 100vw;
  box-sizing: border-box;
}

// ── Header ──
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
}
.header-badge {
  display: inline-block;
  background: #42b983;
  color: white;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 6px;
}
.header-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #1a2e1a;
  letter-spacing: -0.5px;
}
.header-sub { font-size: 13px; color: #7a9a7a; margin: 0; }
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #7a9a7a;
}
.live-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #42b983;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}
.live-text { font-weight: 600; color: #42b983; }

// ── KPI Cards ──
.kpi-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}
.kpi-card {
  background: white;
  border-radius: 14px;
  padding: 18px 20px 14px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
}
.kpi-icon { font-size: 26px; margin-bottom: 8px; }
.kpi-label { font-size: 12px; color: #7a9a7a; font-weight: 500; margin-bottom: 4px; }
.kpi-value { font-size: 13px; color: #1a2e1a; font-weight: 600; }
.kpi-num { font-size: 26px; font-weight: 700; font-family: 'DM Mono', monospace; }
.kpi-unit { font-size: 13px; color: #7a9a7a; margin-left: 2px; }
.kpi-trend { font-size: 11px; font-weight: 600; margin-top: 6px; }
.kpi-trend.up { color: #42b983; }
.kpi-trend.down { color: #e85d5d; }
.kpi-spark {
  position: absolute; bottom: 10px; right: 10px;
  width: 70px; height: 28px; opacity: 0.4;
}
.kpi-1 .kpi-spark { color: #42b983; }
.kpi-2 .kpi-spark { color: #6c9eff; }
.kpi-3 .kpi-spark { color: #f5a623; }
.kpi-4 .kpi-spark { color: #42b983; }
.kpi-5 .kpi-spark { color: #e85d5d; }

// ── Chart Card Base ──
.chart-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.card-title { font-size: 14px; font-weight: 700; color: #1a2e1a; }
.legend-row { display: flex; gap: 14px; }
.legend-item { font-size: 12px; color: #7a9a7a; display: flex; align-items: center; gap: 5px; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.dot-green { background: #42b983; }
.dot-orange { background: #f5a623; }
.dot-blue { background: #6c9eff; }

// ── Mid Row ──
.mid-row {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 14px;
  margin-bottom: 20px;
}
.chart-wide {}
.chart-narrow {}

// ── Bar Chart ──
.bar-chart-wrap {
  display: flex;
  gap: 8px;
  height: 160px;
}
.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 11px;
  color: #aac4aa;
  padding-bottom: 20px;
  text-align: right;
  min-width: 28px;
}
.bars-area {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 0;
  position: relative;
  padding-bottom: 20px;
}
.grid-lines {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 20px;
  pointer-events: none;
}
.grid-line {
  position: absolute;
  left: 0; right: 0;
  height: 1px;
  background: #f0f4f0;
  &:nth-child(1) { top: 0%; }
  &:nth-child(2) { top: 25%; }
  &:nth-child(3) { top: 50%; }
  &:nth-child(4) { top: 75%; }
}
.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.bar-pair {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 140px;
}
.bar {
  width: 10px;
  border-radius: 4px 4px 0 0;
  position: relative;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.8; }
  &:hover .bar-tip { display: block; }
}
.bar-green { background: linear-gradient(to top, #2d8a5e, #42b983); }
.bar-orange { background: linear-gradient(to top, #d4860e, #f5a623); }
.bar-tip {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1a2e1a;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 4px;
  white-space: nowrap;
  margin-bottom: 3px;
  z-index: 10;
}
.bar-label {
  font-size: 10px;
  color: #aac4aa;
  position: absolute;
  bottom: 0;
  white-space: nowrap;
}

// ── Donut ──
.donut-wrap { display: flex; justify-content: center; margin-bottom: 14px; }
.donut-svg { width: 150px; height: 150px; }
.donut-seg { transition: stroke-width 0.2s; &:hover { stroke-width: 32; } }
.donut-center-val { font-size: 22px; font-weight: 700; fill: #1a2e1a; font-family: 'DM Mono', monospace; }
.donut-center-label { font-size: 9px; fill: #7a9a7a; }
.donut-legend { display: flex; flex-direction: column; gap: 6px; }
.dl-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.dl-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.dl-name { flex: 1; color: #4a6a4a; }
.dl-pct { font-weight: 700; color: #1a2e1a; font-family: 'DM Mono', monospace; }

// ── Bottom Row ──
.bot-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

// ── Rank List ──
.rank-list { display: flex; flex-direction: column; gap: 8px; }
.rank-item { display: flex; align-items: center; gap: 8px; }
.rank-no {
  width: 20px; height: 20px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; background: #f0f4f0; color: #7a9a7a;
  flex-shrink: 0;
}
.rank-1 { background: #f5a623; color: white; }
.rank-2 { background: #aac4aa; color: white; }
.rank-3 { background: #c49a6c; color: white; }
.rank-name { font-size: 12px; color: #4a6a4a; width: 90px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rank-bar-wrap { flex: 1; height: 6px; background: #f0f4f0; border-radius: 3px; overflow: hidden; }
.rank-bar { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
.rank-val { font-size: 11px; color: #7a9a7a; font-family: 'DM Mono', monospace; width: 46px; text-align: right; flex-shrink: 0; }

// ── Region ──
.region-list { display: flex; flex-direction: column; gap: 12px; }
.region-item {}
.region-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
.region-name { font-size: 12px; color: #4a6a4a; font-weight: 500; }
.region-amt { font-size: 12px; font-weight: 700; color: #1a2e1a; font-family: 'DM Mono', monospace; }
.region-bar-bg { height: 6px; background: #f0f4f0; border-radius: 3px; overflow: hidden; margin-bottom: 2px; }
.region-bar-fill { height: 100%; background: linear-gradient(to right, #42b983, #73d9a8); border-radius: 3px; transition: width 0.6s ease; }
.region-pct { font-size: 10px; color: #aac4aa; }

// ── Task + User ──
.task-stats { display: flex; gap: 10px; justify-content: space-between; }
.task-item { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
.task-circle {
  width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  opacity: 0.9;
}
.task-num { font-size: 16px; font-weight: 700; color: white; font-family: 'DM Mono', monospace; }
.task-label { font-size: 11px; color: #7a9a7a; text-align: center; }
.divider { height: 1px; background: #f0f4f0; margin: 12px 0 0; }

.user-composition { padding-top: 4px; }
.uc-bar { height: 10px; border-radius: 5px; overflow: hidden; display: flex; margin-bottom: 8px; }
.uc-seg { height: 100%; transition: width 0.6s; }
.uc-legend { display: flex; gap: 12px; }
.uc-item {
  font-size: 11px; color: #7a9a7a; display: flex; align-items: center; gap: 4px;
  em { display: inline-block; width: 8px; height: 8px; border-radius: 2px; }
}

.rating-row { display: flex; align-items: center; gap: 10px; padding-top: 4px; }
.rating-big { font-size: 32px; font-weight: 700; color: #1a2e1a; font-family: 'DM Mono', monospace; line-height: 1; }
.stars { color: #f5a623; font-size: 16px; letter-spacing: 1px; }
.rating-sub { font-size: 11px; color: #aac4aa; }

// ── Bottom 2 Row ──
.bot2-row { }
.chart-full { }
.line-chart-wrap { position: relative; }
.line-svg { width: 100%; height: 120px; display: block; }
.line-x-labels {
  display: flex;
  justify-content: space-between;
  padding: 4px 0 0;
  font-size: 11px;
  color: #aac4aa;
}
</style>
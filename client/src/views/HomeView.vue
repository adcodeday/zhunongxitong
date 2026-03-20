<template>
  <div class="home">
    <!-- 顶部搜索栏 -->
    <div class="topbar">
      <div class="topbar-logo">
        <img src="../assets/png/1745563538557.png" alt="logo" class="logo-img" />
        <span class="logo-text">助农商城</span>
      </div>
      <div class="topbar-search">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchText"
          @keyup.enter="onSearch"
          placeholder="搜索新鲜农产品..."
          class="search-input"
        />
        <button class="search-btn" @click="onSearch">搜索</button>
      </div>
      <div class="topbar-right">
        <div class="cart-trigger" @click="toggleCart">
          <span class="cart-emoji">🛒</span>
          <span class="cart-trigger-txt">购物车</span>
          <span class="cart-badge-sm" v-if="cartItems.length">{{ cartItems.length }}</span>
        </div>
      </div>
    </div>

    <!-- 主体 -->
    <div class="main-layout">
      <!-- 左侧分类 -->
      <aside class="sidebar">
        <div class="sidebar-title">商品分类</div>
        <div
          class="sidebar-item"
          :class="{ active: activeCategory === 0 }"
          @click="filterByCategory(0)"
        >
          <span class="si-icon">🏠</span>
          <span class="si-name">全部商品</span>
        </div>
        <div
          class="sidebar-item"
          v-for="cat in categories"
          :key="cat.id"
          :class="{ active: activeCategory === cat.id }"
          @click="filterByCategory(cat.id)"
        >
          <span class="si-icon">{{ cat.icon }}</span>
          <span class="si-name">{{ cat.name }}</span>
        </div>
      </aside>

      <!-- 右侧内容 -->
      <div class="content-area">
        <!-- 轮播图 -->
        <div class="banner-box">
          <div class="banner-slides">
            <div
              class="banner-slide"
              v-for="(b, i) in banners"
              :key="b.id"
              v-show="i === currentBanner"
            >
              <img :src="b.image" :alt="b.title" class="banner-img" />
              <div class="banner-caption">
                <span class="banner-tag">{{ b.tag }}</span>
                <h2 class="banner-title">{{ b.title }}</h2>
                <p class="banner-desc">{{ b.desc }}</p>
              </div>
            </div>
          </div>
          <button class="bn-arrow bn-left" @click="prevBanner">‹</button>
          <button class="bn-arrow bn-right" @click="nextBanner">›</button>
          <div class="bn-dots">
            <span
              v-for="(b, i) in banners"
              :key="b.id"
              :class="{ active: i === currentBanner }"
              @click="goToBanner(i)"
            ></span>
          </div>
          <!-- 右侧小图 -->
          <div class="banner-side">
            <div class="side-card side-green">
              <div class="side-card-tag">新品上市</div>
              <div class="side-card-title">春季时蔬</div>
              <div class="side-card-sub">产地直发 · 次日达</div>
              <div class="side-card-img">🥬</div>
            </div>
            <div class="side-card side-orange">
              <div class="side-card-tag">限时特惠</div>
              <div class="side-card-title">有机水果</div>
              <div class="side-card-sub">满99元减20元</div>
              <div class="side-card-img">🍊</div>
            </div>
          </div>
        </div>

        <!-- 公告栏 -->
        <div class="notice-bar">
          <span class="notice-label">📢 公告</span>
          <div class="notice-scroll">
            <span>平台正式上线 · 助力农产品销售 &nbsp;|&nbsp; 新用户注册即享优惠券 &nbsp;|&nbsp; 每周三爆款秒杀活动开启 &nbsp;|&nbsp; 全国配送，产地直达</span>
          </div>
        </div>

        <!-- 特色板块 -->
        <div class="feature-row">
          <div class="feature-item" v-for="f in features" :key="f.title">
            <span class="f-icon">{{ f.icon }}</span>
            <div>
              <div class="f-title">{{ f.title }}</div>
              <div class="f-sub">{{ f.sub }}</div>
            </div>
          </div>
        </div>

        <!-- 商品区 -->
        <div class="product-section">
          <div class="ps-header">
            <div class="ps-title-wrap">
              <span class="ps-bar"></span>
              <span class="ps-title">
                {{ activeCategory === 0 ? '全部商品' : categories.find(c => c.id === activeCategory)?.name }}
              </span>
              <span class="ps-count">共 {{ filteredProducts.length }} 件</span>
            </div>
            <div class="ps-sort">
              <span
                v-for="s in sorts"
                :key="s.key"
                :class="{ active: currentSort === s.key }"
                @click="currentSort = s.key"
              >{{ s.label }}</span>
            </div>
          </div>

          <!-- 加载 -->
          <div v-if="loading" class="load-wrap">
            <div class="spinner"></div>
            <p>正在加载商品...</p>
          </div>

          <!-- 空 -->
          <div v-else-if="filteredProducts.length === 0" class="empty-wrap">
            <div style="font-size:56px">🌿</div>
            <p>暂无相关商品</p>
          </div>

          <!-- 商品网格 -->
          <div v-else class="product-grid">
            <div
              class="product-card"
              v-for="product in sortedProducts"
              :key="product.id"
            >
              <!-- 标签 -->
              <div class="pc-badges">
                <span class="badge-hot" v-if="product.tags && product.tags.includes('热销')">热销</span>
                <span class="badge-new" v-if="product.tags && product.tags.includes('新品')">新品</span>
              </div>
              <!-- 图片 -->
              <div class="pc-img-wrap">
                <img :src="product.image" :alt="product.name" class="pc-img" />
                <div class="pc-overlay">
                  <button class="overlay-btn" @click="addToCart(product)">加入购物车</button>
                </div>
              </div>
              <!-- 信息 -->
              <div class="pc-info">
                <div class="pc-name">{{ product.name }}</div>
                <div class="pc-amount" v-if="product.amount">{{ product.amount }}</div>
                <div class="pc-price-row">
                  <span class="pc-price">¥{{ product.price }}</span>
                  <span class="pc-origin" v-if="product.originalPrice > product.price">¥{{ product.originalPrice }}</span>
                </div>
                <div class="pc-footer">
                  <span class="pc-sales">已售 {{ product.sales }}</span>
                  <button class="pc-cart-btn" @click="addToCart(product)">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 购物车悬浮 -->
    <div class="float-cart" @click="toggleCart">
      <span>🛒</span>
      <span class="float-badge" v-if="cartItems.length">{{ cartItems.length }}</span>
    </div>

    <!-- 购物车遮罩 -->
    <div class="cart-mask" :class="{ show: isCartVisible }" @click="toggleCart"></div>

    <!-- 购物车抽屉 -->
    <div class="cart-drawer" :class="{ open: isCartVisible }">
      <div class="cd-header">
        <span class="cd-title">🛒 我的购物车</span>
        <button class="cd-close" @click="toggleCart">✕</button>
      </div>

      <div v-if="cartItems.length" class="cd-body">
        <div class="cd-list">
          <div class="cd-item" v-for="item in cartItems" :key="item.id">
            <div class="cdi-info">
              <div class="cdi-name">{{ item.name }}</div>
              <div class="cdi-price">¥{{ item.price }} / 件</div>
            </div>
            <div class="cdi-ctrl">
              <button class="ctrl-btn" @click="updateQuantity(item.id, -1)">−</button>
              <span class="ctrl-num">{{ item.quantity }}</span>
              <button class="ctrl-btn" @click="updateQuantity(item.id, 1)">+</button>
            </div>
            <div class="cdi-sub">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
            <button class="cdi-del" @click="removeFromCart(item.id)">🗑</button>
          </div>
        </div>
        <div class="cd-footer">
          <div class="cd-summary">
            <span>共 {{ cartItems.reduce((s, i) => s + i.quantity, 0) }} 件商品</span>
            <span class="cd-total">合计 <em>¥{{ cartTotal.toFixed(2) }}</em></span>
          </div>
          <button class="cd-checkout" @click="showPaymentModal">去结算</button>
        </div>
      </div>

      <div v-else class="cd-empty">
        <div style="font-size:64px;margin-bottom:12px">🛒</div>
        <p>购物车还是空的</p>
        <p style="font-size:13px;color:#aaa;margin-top:4px">快去挑选心仪商品吧～</p>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <div class="pay-mask" v-if="showModal" @click.self="closeModal">
      <div class="pay-modal">
        <div class="pm-header">
          <span>扫码支付</span>
          <button @click="closeModal">✕</button>
        </div>
        <img src="../assets/png/shou.jpg" alt="收款码" class="pm-qr" />
        <div class="pm-amount">
          <span class="pm-label">支付金额</span>
          <span class="pm-price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <p class="pm-tip">请使用微信 / 支付宝扫码完成支付</p>
        <div class="pm-actions">
          <button class="pm-cancel" @click="closeModal">取消</button>
          <button class="pm-confirm" @click="completePayment" :disabled="paying">
            {{ paying ? '处理中...' : '✓ 已完成支付' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL
const searchText = ref('')
const activeCategory = ref(0)
const currentBanner = ref(0)
const currentSort = ref('default')
let bannerTimer = null
const showModal = ref(false)
const totalPrice = ref(0)
const paying = ref(false)

const banners = ref([
  { id: 1, tag: '产地直发', title: '新鲜时令蔬菜', desc: '每日清晨采摘 · 冷链直达您家', image: 'https://img14.360buyimg.com/jdcms/s480x480_jfs/t1/281446/9/26519/84223/680aecd4F98b9ab3f/d9ab87124113aab7.jpg.avif' },
  { id: 2, tag: '限时特惠', title: '有机水果精选', desc: '无农药残留 · 健康好滋味', image: 'https://img30.360buyimg.com/jdcms/s480x480_jfs/t1/271088/1/28044/246693/680ae6e0F51787a5f/5b791bff8b26a8d2.jpg.avif' },
  { id: 3, tag: '农家好货', title: '土鸡蛋礼盒装', desc: '散养土鸡 · 营养更丰富', image: 'https://img30.360buyimg.com/jdcms/s480x480_jfs/t1/271465/17/10177/97665/67e36179F26d37c5d/b159286121a51756.jpg.avif' },
  { id: 4, tag: '新品上市', title: '云南高原蜂蜜', desc: '百花酿造 · 原味纯正', image: 'https://img20.360buyimg.com/jdcms/s480x480_jfs/t1/270478/39/27925/150115/680aed67F3ac8a8b6/ed84c79b11dedc9f.jpg.avif' },
])

const categories = ref([
  { id: 1, name: '水果', icon: '🍎' },
  { id: 2, name: '蔬菜', icon: '🥦' },
  { id: 3, name: '粮油', icon: '🌾' },
  { id: 4, name: '禽蛋', icon: '🥚' },
  { id: 5, name: '水产', icon: '🐟' },
  { id: 6, name: '坚果', icon: '🥜' },
  { id: 7, name: '蜂蜜', icon: '🍯' },
  { id: 8, name: '茶叶', icon: '🍵' },
  { id: 9, name: '特产', icon: '🎁' },
  { id: 10, name: '干货', icon: '🍄' },
])

const features = [
  { icon: '🚚', title: '极速配送', sub: '次日达 · 冷链保鲜' },
  { icon: '🌱', title: '产地直发', sub: '源头品控 · 品质保证' },
  { icon: '🔄', title: '七天退换', sub: '无忧购物 · 放心下单' },
  { icon: '💳', title: '安全支付', sub: '多种方式 · 全程加密' },
  { icon: '📞', title: '专属客服', sub: '7×12小时 · 在线答疑' },
]

const sorts = [
  { key: 'default', label: '综合排序' },
  { key: 'price_asc', label: '价格↑' },
  { key: 'price_desc', label: '价格↓' },
  { key: 'sales', label: '销量优先' },
]

const products = ref([])
const loading = ref(false)
const cartItems = ref([])
const isCartVisible = ref(false)

const fetchProducts = async () => {
  try {
    loading.value = true
    const res = await axios.get(`${apiUrl}/tables/products`)
    if (res.data.data) {
      products.value = activeCategory.value === 0
        ? res.data.data
        : res.data.data.filter(p => p.categoryId === activeCategory.value)
    }
  } catch (e) {
    console.error('获取商品失败', e)
  } finally {
    loading.value = false
  }
}

const filterByCategory = async (id) => {
  activeCategory.value = id
  await fetchProducts()
}

const nextBanner = () => { currentBanner.value = (currentBanner.value + 1) % banners.value.length }
const prevBanner = () => { currentBanner.value = (currentBanner.value - 1 + banners.value.length) % banners.value.length }
const goToBanner = (i) => { currentBanner.value = i }

const filteredProducts = computed(() => {
  if (!searchText.value) return products.value
  return products.value.filter(p => p.name.toLowerCase().includes(searchText.value.toLowerCase()))
})

const sortedProducts = computed(() => {
  const list = [...filteredProducts.value]
  if (currentSort.value === 'price_asc') return list.sort((a, b) => a.price - b.price)
  if (currentSort.value === 'price_desc') return list.sort((a, b) => b.price - a.price)
  if (currentSort.value === 'sales') return list.sort((a, b) => b.sales - a.sales)
  return list
})

const cartTotal = computed(() => cartItems.value.reduce((s, i) => s + i.price * i.quantity, 0))

const toggleCart = () => { isCartVisible.value = !isCartVisible.value }

const addToCart = (product) => {
  const existing = cartItems.value.find(i => i.id === product.id)
  if (existing) { existing.quantity++ }
  else { cartItems.value.push({ id: product.id, name: product.name, price: product.price, quantity: 1 }) }
}

const updateQuantity = (id, delta) => {
  const item = cartItems.value.find(i => i.id === id)
  if (item) { item.quantity += delta; if (item.quantity <= 0) removeFromCart(id) }
}

const removeFromCart = (id) => {
  const idx = cartItems.value.findIndex(i => i.id === id)
  if (idx !== -1) cartItems.value.splice(idx, 1)
}

const onSearch = () => { activeCategory.value = 0 }

const showPaymentModal = () => {
  totalPrice.value = cartTotal.value
  showModal.value = true
}
const closeModal = () => { showModal.value = false }

const completePayment = async () => {
  if (paying.value) return
  paying.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    for (const item of cartItems.value) {
      await axios.post(`${apiUrl}/tables/orders`, {
        user_id: user.id,
        goods: `${item.name} x${item.quantity}`,
        buyer: user.nickName || user.userName,
        seller: '助农平台',
        order_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
        order_amount: item.price * item.quantity,
        order_status: 1
      })
    }
    showModal.value = false
    cartItems.value = []
    isCartVisible.value = false
    alert('支付成功！订单已生成，可在订单管理中查看')
  } catch (e) {
    console.error(e)
    alert('订单生成失败，请联系客服')
  } finally {
    paying.value = false
  }
}

onMounted(() => {
  fetchProducts()
  bannerTimer = setInterval(nextBanner, 4000)
})
onUnmounted(() => { if (bannerTimer) clearInterval(bannerTimer) })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

* { box-sizing: border-box; }

.home {
  margin-top: -20px;
  margin-left: -5vw;
  margin-right: -5vw;
  width: 100vw;
  max-width: 100vw;
  overflow-x: hidden;
}

/* ── Topbar ── */
.topbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 24px;
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 200;
}
.topbar-logo { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.logo-img { height: 30px; }
.logo-text { font-size: 17px; font-weight: 700; color: #2d8a5e; letter-spacing: -0.3px; }

.topbar-search {
  flex: 1;
  max-width: 520px;
  display: flex;
  align-items: center;
  background: #f3f6f3;
  border-radius: 24px;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  overflow: hidden;
  &:focus-within { border-color: #42b983; background: #fff; }
}
.search-icon { padding: 0 10px 0 14px; font-size: 15px; }
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  padding: 8px 0;
  font-family: inherit;
}
.search-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
  &:hover { background: #2d8a5e; }
}

.topbar-right { margin-left: auto; flex-shrink: 0; }
.cart-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 20px;
  background: #f3f6f3;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  transition: background 0.2s;
  &:hover { background: #e6f9f0; color: #2d8a5e; }
}
.cart-trigger-txt { color: #444; }
.cart-badge-sm {
  position: absolute;
  top: -4px; right: -4px;
  background: #e85d5d;
  color: white;
  border-radius: 50%;
  width: 18px; height: 18px;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid white;
}

/* ── Main Layout ── */
.main-layout {
  display: flex;
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 16px;
  gap: 16px;
}

/* ── Sidebar ── */
.sidebar {
  width: 130px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  padding: 12px 8px;
  height: fit-content;
  position: sticky;
  top: 80px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.sidebar-title {
  font-size: 11px;
  font-weight: 700;
  color: #aaa;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 4px 10px 10px;
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { background: #f0faf5; color: #2d8a5e; }
  &.active { background: #e6f9f0; color: #2d8a5e; font-weight: 600; }
}
.si-icon { font-size: 16px; }
.si-name { font-size: 13px; }

/* ── Content Area ── */
.content-area { flex: 1; min-width: 0; }

/* ── Banner ── */
.banner-box {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  position: relative;
}
.banner-slides {
  flex: 1;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  min-height: 220px;
}
.banner-slide {
  position: relative;
  width: 100%;
}
.banner-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}
.banner-caption {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 24px 20px 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
  color: white;
}
.banner-tag {
  display: inline-block;
  background: #42b983;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 6px;
}
.banner-title { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
.banner-desc { font-size: 12px; opacity: 0.85; margin: 0; }

.bn-arrow {
  position: absolute;
  top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.9);
  border: none; cursor: pointer;
  width: 34px; height: 34px; border-radius: 50%;
  font-size: 20px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: all 0.2s; z-index: 2;
  &:hover { background: white; transform: translateY(-50%) scale(1.1); }
}
.bn-left { left: 12px; }
.bn-right { right: 154px; }
.bn-dots {
  position: absolute;
  bottom: 14px; left: 50%;
  transform: translateX(-50%);
  display: flex; gap: 6px; z-index: 2;
  span {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.5); cursor: pointer;
    transition: all 0.3s;
    &.active { background: white; width: 18px; border-radius: 3px; }
  }
}

.banner-side {
  width: 140px;
  display: flex; flex-direction: column; gap: 12px;
  flex-shrink: 0;
}
.side-card {
  flex: 1;
  border-radius: 12px;
  padding: 14px 12px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); }
}
.side-green { background: linear-gradient(135deg, #e6f9f0, #c8f0dc); }
.side-orange { background: linear-gradient(135deg, #fff3e0, #ffe0b0); }
.side-card-tag { font-size: 10px; font-weight: 700; color: #2d8a5e; background: rgba(255,255,255,0.6); padding: 2px 6px; border-radius: 8px; display: inline-block; margin-bottom: 6px; }
.side-green .side-card-tag { color: #2d8a5e; }
.side-orange .side-card-tag { color: #e08000; }
.side-card-title { font-size: 14px; font-weight: 700; color: #1a1a1a; margin-bottom: 3px; }
.side-card-sub { font-size: 11px; color: #666; }
.side-card-img { position: absolute; right: 8px; bottom: 8px; font-size: 32px; opacity: 0.7; }

/* ── Notice Bar ── */
.notice-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border-radius: 8px;
  padding: 9px 16px;
  margin-bottom: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  overflow: hidden;
}
.notice-label {
  font-size: 12px;
  font-weight: 700;
  color: #42b983;
  flex-shrink: 0;
  background: #e6f9f0;
  padding: 2px 8px;
  border-radius: 6px;
}
.notice-scroll {
  flex: 1;
  overflow: hidden;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  span {
    display: inline-block;
    animation: scroll-x 20s linear infinite;
  }
}
@keyframes scroll-x {
  from { transform: translateX(100%); }
  to { transform: translateX(-100%); }
}

/* ── Features ── */
.feature-row {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.feature-item {
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 12px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.f-icon { font-size: 22px; }
.f-title { font-size: 12px; font-weight: 700; color: #1a1a1a; }
.f-sub { font-size: 11px; color: #999; margin-top: 1px; }

/* ── Product Section ── */
.product-section { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.ps-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.ps-title-wrap { display: flex; align-items: center; gap: 8px; }
.ps-bar { width: 4px; height: 18px; background: #42b983; border-radius: 2px; }
.ps-title { font-size: 16px; font-weight: 700; color: #1a1a1a; }
.ps-count { font-size: 12px; color: #aaa; }
.ps-sort { display: flex; gap: 4px; }
.ps-sort span {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 14px;
  cursor: pointer;
  color: #666;
  transition: all 0.15s;
  &:hover { background: #f0faf5; color: #2d8a5e; }
  &.active { background: #42b983; color: white; font-weight: 600; }
}

.load-wrap, .empty-wrap { text-align: center; padding: 60px 0; color: #aaa; }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid #eee; border-top-color: #42b983;
  border-radius: 50%; animation: spin 0.7s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Product Grid ── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px;
}
.product-card {
  background: #fafafa;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
  cursor: pointer;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    border-color: transparent;
    .pc-overlay { opacity: 1; }
    .pc-img { transform: scale(1.06); }
  }
}
.pc-badges { position: absolute; top: 8px; left: 8px; display: flex; gap: 4px; z-index: 2; }
.badge-hot, .badge-new {
  font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 8px;
}
.badge-hot { background: #ff4d4f; color: white; }
.badge-new { background: #42b983; color: white; }

.pc-img-wrap {
  position: relative;
  width: 100%; height: 160px; overflow: hidden;
}
.pc-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.pc-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
}
.overlay-btn {
  background: white; color: #2d8a5e;
  border: none; padding: 7px 16px;
  border-radius: 20px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  &:hover { background: #42b983; color: white; }
}

.pc-info { padding: 10px 12px 12px; }
.pc-name {
  font-size: 13px; color: #222; font-weight: 500;
  overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  min-height: 36px; margin-bottom: 4px;
}
.pc-amount { font-size: 11px; color: #aaa; margin-bottom: 6px; }
.pc-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px; }
.pc-price { font-size: 18px; font-weight: 700; color: #e85d5d; }
.pc-origin { font-size: 11px; color: #ccc; text-decoration: line-through; }
.pc-footer { display: flex; align-items: center; justify-content: space-between; }
.pc-sales { font-size: 11px; color: #bbb; }
.pc-cart-btn {
  width: 26px; height: 26px; border-radius: 50%;
  background: #42b983; color: white; border: none;
  font-size: 18px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  line-height: 1; transition: background 0.2s;
  &:hover { background: #2d8a5e; }
}

/* ── Float Cart ── */
.float-cart {
  position: fixed; right: 24px; bottom: 24px;
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #42b983, #2d8a5e);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; cursor: pointer;
  box-shadow: 0 4px 16px rgba(66,185,131,0.5);
  z-index: 100; transition: transform 0.2s;
  &:hover { transform: scale(1.1); }
}
.float-badge {
  position: absolute; top: -4px; right: -4px;
  background: #e85d5d; color: white; border-radius: 50%;
  width: 18px; height: 18px; font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid white;
}

/* ── Cart Mask & Drawer ── */
.cart-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.3); z-index: 300;
  opacity: 0; pointer-events: none; transition: opacity 0.3s;
  &.show { opacity: 1; pointer-events: all; }
}
.cart-drawer {
  position: fixed; top: 0; right: -420px; bottom: 0;
  width: 400px; background: white;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
  z-index: 400; transition: right 0.3s ease;
  display: flex; flex-direction: column;
  &.open { right: 0; }
}
.cd-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 20px; border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(to right, #f0faf5, #e6f9f0);
}
.cd-title { font-size: 16px; font-weight: 700; color: #1a2e1a; }
.cd-close {
  background: none; border: none; font-size: 18px;
  cursor: pointer; color: #999; line-height: 1;
  &:hover { color: #333; }
}
.cd-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.cd-list { flex: 1; overflow-y: auto; padding: 12px 16px; }
.cd-item {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 0; border-bottom: 1px solid #f5f5f5;
}
.cdi-info { flex: 1; min-width: 0; }
.cdi-name { font-size: 13px; font-weight: 500; color: #222; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cdi-price { font-size: 11px; color: #aaa; margin-top: 2px; }
.cdi-ctrl { display: flex; align-items: center; gap: 6px; }
.ctrl-btn {
  width: 24px; height: 24px; border: 1px solid #e0e0e0;
  background: white; border-radius: 6px; cursor: pointer;
  font-size: 14px; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  &:hover { background: #42b983; color: white; border-color: #42b983; }
}
.ctrl-num { font-size: 14px; font-weight: 600; min-width: 18px; text-align: center; }
.cdi-sub { font-size: 13px; font-weight: 700; color: #e85d5d; min-width: 60px; text-align: right; }
.cdi-del { background: none; border: none; cursor: pointer; font-size: 14px; opacity: 0.4; &:hover { opacity: 1; } }
.cd-footer { padding: 14px 20px; border-top: 1px solid #f0f0f0; background: #fafafa; }
.cd-summary { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 13px; color: #666; }
.cd-total { font-size: 14px; color: #1a1a1a; em { font-style: normal; font-size: 20px; font-weight: 700; color: #e85d5d; } }
.cd-checkout {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #42b983, #2d8a5e);
  color: white; border: none; border-radius: 10px;
  font-size: 15px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
}
.cd-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; }

/* ── Pay Modal ── */
.pay-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); z-index: 500;
  display: flex; align-items: center; justify-content: center;
}
.pay-modal {
  background: white; border-radius: 16px; padding: 28px;
  width: 320px; text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
}
.pm-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px;
  span { font-size: 17px; font-weight: 700; }
  button { background: none; border: none; font-size: 18px; cursor: pointer; color: #999; }
}
.pm-qr { width: 180px; height: 180px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 14px; }
.pm-amount { display: flex; align-items: baseline; justify-content: center; gap: 8px; margin-bottom: 6px; }
.pm-label { font-size: 13px; color: #999; }
.pm-price { font-size: 26px; font-weight: 700; color: #e85d5d; }
.pm-tip { font-size: 12px; color: #aaa; margin-bottom: 20px; }
.pm-actions { display: flex; gap: 10px; }
.pm-cancel, .pm-confirm {
  flex: 1; padding: 11px; border: none; border-radius: 8px;
  font-size: 14px; cursor: pointer; font-family: inherit; transition: opacity 0.2s;
}
.pm-cancel { background: #f5f5f5; color: #666; &:hover { background: #eee; } }
.pm-confirm {
  background: linear-gradient(135deg, #42b983, #2d8a5e);
  color: white; font-weight: 700;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .sidebar { display: none; }
  .banner-side { display: none; }
  .feature-row { flex-wrap: wrap; .feature-item { flex: 1 1 45%; } }
  .bn-right { right: 12px; }
}
@media (max-width: 600px) {
  .main-layout { padding: 12px 10px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .cart-drawer { width: 100%; }
  .topbar-right { display: none; }
}
</style>
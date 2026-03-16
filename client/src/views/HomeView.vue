<template>
  <div class="home-container">
    <!-- 顶部搜索栏 -->
    <div class="top-bar">
      <div class="logo-with-text">
        <img src="../assets/png/1745563538557.png" alt="商标" class="top-logo" />
        <span class="logo-text">助农商品</span>
      </div>
      <div class="search-bar">
        <input
          type="text"
          placeholder="助农产品"
          class="search-input"
          v-model="searchText"
          @keyup.enter="onSearch"
        />
        <button class="search-button" @click="onSearch">搜索</button>
      </div>
    </div>

    <!-- 轮播图 -->
    <div class="banner-container">
      <div
        class="banner"
        v-for="(banner, idx) in banners"
        :key="banner.id"
        v-show="idx === currentBanner"
      >
        <img :src="banner.image" alt="助农活动" class="banner-image" />
      </div>
      <button class="banner-arrow left" @click="prevBanner">&#8592;</button>
      <button class="banner-arrow right" @click="nextBanner">&#8594;</button>
      <div class="banner-dots">
        <span
          v-for="(banner, idx) in banners"
          :key="banner.id"
          :class="{ active: idx === currentBanner }"
          @click="goToBanner(idx)"
        ></span>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-container">
      <div
        class="category-item"
        :class="{ active: activeCategory === 0 }"
        @click="filterByCategory(0)"
      >
        <div class="category-icon">🏠</div>
        <div class="category-name">全部</div>
      </div>
      <div
        class="category-item"
        v-for="category in categories"
        :key="category.id"
        :class="{ active: activeCategory === category.id }"
        @click="filterByCategory(category.id)"
      >
        <div class="category-icon">{{ category.icon }}</div>
        <div class="category-name">{{ category.name }}</div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="product-section">
      <h2 class="section-title">
        {{
          activeCategory === 0 ? '全部商品' : categories.find((c) => c.id === activeCategory)?.name
        }}
      </h2>
      <div class="product-grid">
        <div class="product-card" v-for="product in filteredProducts" :key="product.id">
          <div class="product-badge" v-if="product.tags.includes('热销')">热销</div>
          <img :src="product.image" :alt="product.name" class="product-image" />
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <!-- 新增：显示商品规格 -->
            <div class="product-amount">规格：{{ product.amount }}</div>
            <div class="price-container">
              <span class="current-price">¥{{ product.price }}</span>
              <span class="original-price">¥{{ product.originalPrice }}</span>
            </div>
            <div class="sales">已售 {{ product.sales }}件</div>
            <button class="add-to-cart" @click="addToCart(product)">加入购物车</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 购物车悬浮按钮 -->
    <div class="cart-button" @click="toggleCart">
      <div class="cart-icon">🛒</div>
      <div class="cart-badge" v-if="cartItems.length">{{ cartItems.length }}</div>
    </div>

    <!-- 购物车面板 -->
    <div class="cart-panel" :class="{ 'cart-panel-visible': isCartVisible }">
      <div class="cart-header">
        <h3>购物车</h3>
        <button class="close-cart" @click="toggleCart">×</button>
      </div>
      <div class="cart-items" v-if="cartItems.length">
        <div class="cart-item" v-for="item in cartItems" :key="item.id">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-price">¥{{ item.price }}</div>
          <div class="item-quantity">
            <button @click="updateQuantity(item.id, -1)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="updateQuantity(item.id, 1)">+</button>
          </div>
          <button class="remove-item" @click="removeFromCart(item.id)">删除</button>
        </div>
        <div class="cart-total">
          <span>总计：</span>
          <span class="total-price">¥{{ cartTotal }}</span>
        </div>
        <button class="checkout-button" @click="showPaymentModal">去结算</button>
        
        <!-- 支付弹窗 -->
        <div class="payment-modal" v-if="showModal">
          <div class="modal-content">
            <h3>请扫码支付</h3>
            <img src="../assets/png/shou.jpg" alt="支付二维码" class="qr-code">
            <p>支付金额: ¥{{ totalPrice }}</p>
            <button @click="completePayment">已完成支付</button>
            <button @click="closeModal">取消</button>
          </div>
        </div>
      </div>
      <div class="empty-cart" v-else>
        <p>购物车是空的</p>
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
let bannerTimer = null
const showModal = ref(false)
const totalPrice = ref(0)
// ... existing code ...
const calculateTotalPrice = () => {
  // 这里添加计算总价的逻辑
  // 示例：假设我们有一个购物车列表cartItems
  return cartItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
}
const showPaymentModal = () => {
  // 计算总价逻辑
  totalPrice.value = calculateTotalPrice() 
  showModal.value = true
  console.log('支付金额:' )
  console.log('支付金额:', showModal.value )
}

const completePayment = () => {
  // 支付成功逻辑
  showModal.value = false
  alert('支付成功！')
}

const closeModal = () => {
  showModal.value = false
  alert('支付失败！')
}
// 轮播图数据
const banners = ref([
  {
    id: 1,
    image: 'https://img14.360buyimg.com/jdcms/s480x480_jfs/t1/281446/9/26519/84223/680aecd4F98b9ab3f/d9ab87124113aab7.jpg.avif'
  },
  {
    id: 2,
    image: 'https://img30.360buyimg.com/jdcms/s480x480_jfs/t1/271088/1/28044/246693/680ae6e0F51787a5f/5b791bff8b26a8d2.jpg.avif'
  },
  {
    id: 3,
    image: 'https://img30.360buyimg.com/jdcms/s480x480_jfs/t1/271465/17/10177/97665/67e36179F26d37c5d/b159286121a51756.jpg.avif'
  },
  {
    id: 4,
    image: 'https://img20.360buyimg.com/jdcms/s480x480_jfs/t1/270478/39/27925/150115/680aed67F3ac8a8b6/ed84c79b11dedc9f.jpg.avif'
  }
])

// 分类数据
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
  { id: 10, name: '干货', icon: '🍄' }
])

// 商品数据
const products = ref([])
const loading = ref(false)
const error = ref('')

// 购物车相关
const cartItems = ref([])
const isCartVisible = ref(false)

// 获取商品数据
const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await axios.get(`${apiUrl}/tables/products`)
    console.log('获取到的数据',response.data.data)
    console.log(response.data.data)
    if (response.data.data) {
      // 根据选中的分类过滤数据
      if (activeCategory.value === 0) {
        // 全部商品
        products.value = response.data.data
      } else {
        // 根据分类ID过滤
        products.value = response.data.data.filter(
          product => product.categoryId === activeCategory.value
        )
      }
    }
  } catch (err) {
    error.value = '获取商品数据失败'
    console.error('获取商品数据失败:', err)
  } finally {
    loading.value = false
  }
}

// 修改分类过滤函数
const filterByCategory = async (categoryId) => {
  activeCategory.value = categoryId
  // 当切换分类时重新获取数据
  await fetchProducts()
}

// 轮播图控制
const nextBanner = () => {
  currentBanner.value = (currentBanner.value + 1) % banners.value.length
}

const prevBanner = () => {
  currentBanner.value = (currentBanner.value - 1 + banners.value.length) % banners.value.length
}

const goToBanner = (idx) => {
  currentBanner.value = idx
}

// 商品过滤
const filteredProducts = computed(() => {
  let filtered = products.value
  if (searchText.value) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchText.value.toLowerCase()))
  }
  // 由于数据已经是从对应表获取的，这里不需要再次过滤分类
  return filtered
})

// 购物车计算总价
const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
})

// 购物车操作
const toggleCart = () => {
  isCartVisible.value = !isCartVisible.value
}

const addToCart = (product) => {
  const existingItem = cartItems.value.find(item => item.id === product.id)
  if (existingItem) {
    existingItem.quantity++
  } else {
    cartItems.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    })
  }
}

const updateQuantity = (productId, change) => {
  const item = cartItems.value.find(item => item.id === productId)
  if (item) {
    item.quantity += change
    if (item.quantity <= 0) {
      removeFromCart(productId)
    }
  }
}

const removeFromCart = (productId) => {
  const index = cartItems.value.findIndex(item => item.id === productId)
  if (index !== -1) {
    cartItems.value.splice(index, 1)
  }
}

// 搜索功能
const onSearch = () => {
  // 触发商品过滤
  activeCategory.value = 0
}

onMounted(() => {
  fetchProducts()
  bannerTimer = setInterval(nextBanner, 3000)
})

onUnmounted(() => {
  if (bannerTimer) {
    clearInterval(bannerTimer)
  }
})
</script>

<style scoped>
/* 基础容器样式 */
.home-container {
  width: 130%; /* 占满视口宽度 */
  min-height: 100vh;
  padding: 0;
  background: #f5f5f5;
  overflow-x: hidden; /* 防止水平滚动条 */
}

/* 搜索栏样式 */
.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0 10px 0; /* 调整内边距 */
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  position: sticky; /* 吸顶效果 */
  top: 0;
  z-index: 10;
}

.search-input {
  width: 450px; /* 稍微加宽 */
  height: 38px;
  border: 1px solid #eee;
  border-radius: 20px 0 0 20px;
  padding: 0 16px;
  font-size: 16px;
  outline: none;
}

.search-button {
  height: 38px;
  border: none;
  background: #42b983;
  color: #fff;
  border-radius: 0 20px 20px 0;
  padding: 0 24px;
  font-size: 16px;
  cursor: pointer;
}

/* 轮播图样式 */
.banner-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 16px 0;
  background: white;
  width: 100%; /* 宽度100% */
  max-width: 1200px; /* 限制最大宽度，居中 */
  margin: 10px auto; /* 上下边距，左右自动居中 */
  border-radius: 12px; /* 圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.banner {
  width: 100%; /* 图片宽度占满容器 */
  transition: opacity 0.5s ease-in-out; /* 平滑过渡 */
}
.banner-image {
  width: 100%;
  height: 200px; /* 调整高度 */
  object-fit: cover; /* 保持比例填充 */
  display: block; /* 消除图片底部空隙 */
}
.banner-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3); /* 半透明背景 */
  color: white; /* 箭头颜色 */
  border: none;
  font-size: 28px; /* 增大箭头 */
  cursor: pointer;
  z-index: 2;
  padding: 8px 12px; /* 调整内边距 */
  border-radius: 50%;
  transition: background 0.2s;
}
.banner-arrow:hover {
  background: rgba(0, 0, 0, 0.5);
}
.banner-arrow.left {
  left: 15px;
}
.banner-arrow.right {
  right: 15px;
}
.banner-dots {
  position: absolute;
  bottom: 15px; /* 调整位置 */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px; /* 增大间距 */
  z-index: 2;
}
.banner-dots span {
  display: inline-block;
  width: 10px; /* 增大圆点 */
  height: 10px;
  background: rgba(255, 255, 255, 0.6); /* 半透明白 */
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s;
}
.banner-dots span.active {
  background: #42b983; /* 激活颜色 */
}

/* 分类导航样式 */
.category-container {
  display: flex;
  overflow-x: auto; /* 水平滚动 */
  background: white;
  padding: 16px 5%; /* 左右留白 */
  border-bottom: 1px solid #eee;
  /* 隐藏滚动条 (可选) */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.category-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.category-item {
  flex: 0 0 auto; /* 不伸缩，不压缩，基于内容宽度 */
  margin: 0 15px; /* 增大间距 */
  text-align: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition:
    background 0.2s,
    color 0.2s;
  font-size: 15px; /* 调整字体大小 */
  color: #333;
}
.category-item:hover {
  color: #42b983;
}
.category-item.active {
  background: #e6f9f0;
  color: #42b983;
  font-weight: bold;
}
.category-icon {
  font-size: 24px; /* 增大图标 */
  margin-bottom: 4px;
}

/* 商品列表区域样式 */
.product-section {
  width: 100%; /* 占满父容器宽度 */
  max-width: 1920px; /* 设置最大宽度，模拟京东效果 */
  margin: 25px auto 0 auto; /* 上边距，左右自动居中 */
  padding: 0 10px; /* 左右留出微小边距 */
  box-sizing: border-box; /* padding包含在width内 */
}

.section-title {
  font-size: 22px; /* 增大标题 */
  font-weight: bold;
  margin-bottom: 20px; /* 增大下边距 */
  color: #333;
  padding-left: 5px; /* 微调左边距 */
}

/* 商品网格布局 */
.product-grid {
  width: 100%;
  margin: 0 auto;
  display: grid;
  /* 核心：更小的最小宽度，实现更密集的布局 */
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px; /* 减小间距 */
  justify-items: stretch; /* 项目在网格区域内水平拉伸 */
  align-items: start; /* 项目在网格区域内顶部对齐 */
}

/* 商品卡片样式 */
.product-card {
  background: white;
  border-radius: 8px; /* 减小圆角 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05); /* 调整阴影 */
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  height: auto; /* 高度自适应 */
  min-width: 0; /* 防止内容溢出 */
  padding-bottom: 10px; /* 底部留白 */
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 悬浮阴影 */
}

.product-badge {
  position: absolute;
  top: 8px; /* 调整位置 */
  left: 8px;
  background: #ff0036;
  color: #fff;
  padding: 2px 6px; /* 调整内边距 */
  border-radius: 4px; /* 减小圆角 */
  font-size: 11px; /* 减小字号 */
  z-index: 2;
  font-weight: bold;
}

.product-image {
  width: 100%;
  height: 160px; /* 调整图片高度 */
  object-fit: cover;
  display: block;
}

.product-info {
  padding: 10px 12px; /* 调整内边距 */
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 14px; /* 调整字号 */
  font-weight: normal; /* 正常字重 */
  color: #333;
  margin-bottom: -10px; /* 调整间距 */ /* 减小一点，给规格留空间 */
  /* 最多显示两行，超出省略 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 38px; /* 保证两行的高度 */
}

/* 新增：商品规格样式 */
.product-amount {
  font-size: 12px; /* 规格字号 */
  color: #666;    /* 规格颜色 */
  margin-bottom: 2px; /* 与价格的间距 */
  /* 可选：如果规格也可能很长，可以添加省略号 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.price-container {
  display: flex;
  align-items: baseline; /* 基线对齐 */
  margin-bottom: 6px;
}

.current-price {
  color: #ff0036;
  font-size: 18px; /* 调整字号 */
  font-weight: bold;
  margin-right: 6px;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 12px; /* 调整字号 */
}

.sales {
  color: #999; /* 调整颜色 */
  font-size: 12px; /* 调整字号 */
  margin-bottom: 8px;
}

.add-to-cart {
  width: calc(100% - 24px); /* 宽度适应内边距 */
  margin: 0 auto; /* 居中 */
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 15px; /* 圆角按钮 */
  padding: 6px 0; /* 调整内边距 */
  font-size: 14px; /* 调整字号 */
  cursor: pointer;
  transition: background 0.2s;
  display: block; /* 块级元素方便居中 */
}

.add-to-cart:hover {
  background: #369870;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .product-section {
    max-width: 100vw; /* 中等屏幕取消最大宽度限制 */
    padding: 0 15px; /* 增加左右内边距 */
  }
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); /* 调整列宽 */
    gap: 10px;
  }
  .product-image {
    height: 140px;
  }
  .search-input {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .search-bar {
    padding: 15px 0 8px 0;
  }
  .search-input {
    width: 250px;
    font-size: 14px;
  }
  .search-button {
    padding: 0 18px;
    font-size: 14px;
  }
  .banner-container {
    margin: 8px auto;
    border-radius: 8px;
  }
  .banner-image {
    height: 150px;
  }
  .banner-arrow {
    font-size: 20px;
    padding: 4px 8px;
  }
  .banner-dots span {
    width: 8px;
    height: 8px;
  }
  .category-container {
    padding: 12px 3%;
  }
  .category-item {
    margin: 0 10px;
    font-size: 14px;
  }
  .category-icon {
    font-size: 20px;
  }
  .product-section {
    margin-top: 20px;
    padding: 0 10px; /* 调整内边距 */
  }
  .section-title {
    font-size: 18px;
    margin-bottom: 15px;
  }
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); /* 调整列宽 */
    gap: 8px;
  }
  .product-image {
    height: 120px;
  }
  .product-name {
    font-size: 13px;
    min-height: 34px;
  }
  .current-price {
    font-size: 16px;
  }
  .add-to-cart {
    font-size: 13px;
    padding: 5px 0;
  }
}

@media (max-width: 480px) {
  .search-input {
    width: 65%; /* 使用百分比 */
  }
  .banner-image {
    height: 120px;
  }
  .product-section {
    padding: 0 5px; /* 极小屏幕内边距 */
  }
  .product-grid {
    grid-template-columns: repeat(2, 1fr); /* 固定两列 */
    gap: 6px;
  }
  .product-image {
    height: 100px; /* 进一步减小图片高度 */
  }
  .product-info {
    padding: 8px;
  }
  .product-name {
    font-size: 12px;
    min-height: 32px;
  }
  .current-price {
    font-size: 14px;
  }
  .sales,
  .original-price {
    font-size: 11px;
  }
  .add-to-cart {
    font-size: 12px;
    padding: 4px 0;
    width: calc(100% - 16px);
  }
}
.top-bar {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 商标/文字和搜索框左右分布 */
  padding: 15px 20px; /* 调整上下左右内边距 */
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo-with-text {
  display: flex;
  align-items: center; /* 图标和文字垂直居中 */
}

.top-logo {
  max-height: 30px; /* 调整商标高度 */
  margin-right: 10px; /* 商标和文字的间距 */
}

.logo-text {
  font-size: 18px; /* 调整文字大小 */
  color: #333;
  font-weight: bold;
}

.search-bar {
  display: flex;
  align-items: center; /* 与输入框和按钮垂直对齐 */
}

.search-input {
  width: 350px; /* 调整输入框宽度 */
  height: 36px; /* 调整输入框高度 */
  border: 1px solid #eee;
  border-radius: 18px 0 0 18px;
  padding: 0 16px;
  font-size: 16px;
  outline: none;
}

.search-button {
  height: 36px; /* 与输入框高度一致 */
  border: none;
  background: #42b983;
  color: #fff;
  border-radius: 0 18px 18px 0;
  padding: 0 18px; /* 调整按钮左右内边距 */
  font-size: 16px;
  cursor: pointer;
}

/* ... 其他样式 ... */

/* 响应式适配 */
@media (max-width: 768px) {
  .top-bar {
    padding: 10px 15px;
  }
  .top-logo {
    max-height: 24px;
    margin-right: 8px;
  }
  .logo-text {
    font-size: 16px;
  }
  .search-input {
    width: 200px;
    font-size: 14px;
  }
  .search-button {
    padding: 0 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .top-bar {
    flex-direction: column; /* 小屏幕垂直排列 */
    align-items: flex-start; /* 左对齐 */
  }
  .logo-with-text {
    margin-bottom: 10px; /* 和搜索框拉开距离 */
  }
  .top-logo {
    max-height: 20px;
    margin-right: 6px;
  }
  .logo-text {
    font-size: 14px;
  }
  .search-input {
    width: 100%; /* 宽度占满容器 */
    border-radius: 18px; /* 小屏幕圆角 */
  }
  .search-button {
    display: none; /* 小屏幕可以考虑隐藏搜索按钮，使用键盘搜索 */
    /* 或者调整样式适应 */
  }
  .search-bar {
    width: 100%;
  }
}
/* 购物车按钮样式 */
.cart-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
  background: #42b983;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.cart-icon {
  font-size: 24px;
  color: white;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff0036;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* 购物车面板样式 */
.cart-panel {
  position: fixed;
  right: -400px;
  top: 0;
  width: 380px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1001;
  padding: 20px;
  box-sizing: border-box;
}

.cart-panel-visible {
  right: 0;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-cart {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.cart-items {
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.cart-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-quantity button {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.remove-item {
  color: #ff0036;
  background: none;
  border: none;
  cursor: pointer;
}

.cart-total {
  margin-top: 20px;
  padding: 15px 0;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.total-price {
  color: #ff0036;
  font-size: 18px;
}

.checkout-button {
  width: 100%;
  padding: 12px 0;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  margin-top: 15px;
  cursor: pointer;
  font-size: 16px;
}

.empty-cart {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .cart-panel {
    width: 100%;
    right: -100%;
  }

  .cart-button {
    width: 50px;
    height: 50px;
    right: 15px;
    bottom: 15px;
  }

  .cart-icon {
    font-size: 20px;
  }
}

.payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    
    .qr-code {
      width: 200px;
      height: 200px;
      margin: 15px 0;
    }
    
    button {
      margin: 0 10px;
      padding: 8px 16px;
    }
  }
}
</style>
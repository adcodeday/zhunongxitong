<template>
  <div class="farm-assistant">
    <header>
      <h1 class="logo">智慧助农电商平台</h1>
      <button v-if="isMobile" class="menu-toggle" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav :class="{ 'mobile-menu': isMobile, open: menuOpen }">
        <RouterLink v-if="user" to="/" @click="menuOpen = false">首页</RouterLink>
        <RouterLink v-if="user && user.authority == 0" to="/products" @click="menuOpen = false">农产品管理</RouterLink>
        <RouterLink v-if="user && user.authority == 0" to="/farmers" @click="menuOpen = false">农户管理</RouterLink>
        <RouterLink v-if="user && (user.authority == 0 || user.authority == 1)" to="/tasks" @click="menuOpen = false">任务管理</RouterLink>
        <RouterLink v-if="user" to="/orders" @click="menuOpen = false">订单管理</RouterLink>
        <RouterLink v-if="user" to="/statistics" @click="menuOpen = false">数据统计</RouterLink>
        <RouterLink v-if="user" to="/news" @click="menuOpen = false">问题咨询</RouterLink>
        <RouterLink v-if="user" to="/personal" @click="menuOpen = false">个人中心</RouterLink>
        <RouterLink v-if="user" to="#" @click="showLogoutConfirm" class="logout-link">退出登录</RouterLink>
      </nav>
    </header>

    <main :class="{ 'main-home': isHome }">
      <RouterView />
    </main>

    <!-- 退出登录确认弹窗 -->
    <el-dialog v-model="logoutDialogVisible" title="确认退出" width="30%" center>
      <span>确定要退出登录吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="logoutDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmLogout">确认退出</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'

const isMobile = ref(false)
const menuOpen = ref(false)
const user = ref(null)
const router = useRouter()
const route = useRoute()
const logoutDialogVisible = ref(false)

// 判断是否是首页，首页不加 padding
const isHome = computed(() => route.path === '/')

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
}

const showLogoutConfirm = (event) => {
  event.preventDefault()
  logoutDialogVisible.value = true
  if (isMobile.value) menuOpen.value = false
}

const confirmLogout = () => {
  logout()
  logoutDialogVisible.value = false
}

const logout = () => {
  localStorage.removeItem('user')
  user.value = null
  ElMessage.success('已退出登录')
  router.push('/login')
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  const userStr = localStorage.getItem('user')
  if (userStr) user.value = JSON.parse(userStr)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped lang="scss">
.farm-assistant {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5%;
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  z-index: 1000;
}

.logo {
  font-size: 1.2rem;
  font-weight: bold;
  color: #42b983;
  margin-right: 30px;
  white-space: nowrap;
}

nav a {
  margin-left: 4px;
  color: #555;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
}

nav a:hover {
  background-color: #f0faf5;
  color: #42b983;
}

nav a.router-link-exact-active {
  color: #42b983;
  font-weight: bold;
  background-color: rgba(66, 185, 131, 0.1);
}

/* 首页：不加 padding，内容铺满 */
main {
  margin-top: 60px;
  padding: 24px 5%;
  min-height: calc(100vh - 60px);
  background: #f3f6f3;
}

main.main-home {
  padding: 0;
  margin-top: 60px;
  background: transparent;
}

/* 移动端 */
.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;

  span {
    display: block;
    width: 25px;
    height: 3px;
    background-color: #333;
    margin: 5px 0;
    transition: all 0.3s ease;
  }
}

.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  flex-direction: column;
  padding: 10px 0;
}

.mobile-menu.open {
  display: flex;
}

.mobile-menu a {
  margin: 0;
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
  border-radius: 0;
}

@media (max-width: 768px) {
  .menu-toggle { display: block; }
  nav:not(.mobile-menu) { display: none; }
  main { margin-top: 60px; padding: 16px; }
  main.main-home { padding: 0; }
}

@media (min-width: 769px) {
  .mobile-menu { display: none !important; }
}

/* 退出登录 */
.logout-link {
  color: #f56c6c !important;
  text-decoration: none;
  transition: all 0.2s ease;
  background-color: transparent !important;
  border-radius: 6px;
  font-weight: 500;

  &:hover {
    background-color: rgba(245, 108, 108, 0.1) !important;
    color: #f56c6c !important;
  }
}

.mobile-menu .logout-link {
  margin: 0;
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
  border-radius: 0;
}

/* 弹窗 */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

:deep(.el-dialog__header) {
  text-align: center;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

:deep(.el-dialog__body) {
  text-align: center;
  padding: 30px 20px;
  font-size: 16px;
}
</style>
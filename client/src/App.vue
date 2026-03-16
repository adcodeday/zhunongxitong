<template>
  <div class="farm-assistant">
    <header>
      <h1 class="logo">助农管理系统</h1>
      <button v-if="isMobile" class="menu-toggle" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav :class="{ 'mobile-menu': isMobile, open: menuOpen }">
        <RouterLink v-if="user" to="/" @click="menuOpen = false">首页</RouterLink>
        <RouterLink v-if="user && user.authority == 0" to="/products">农产品管理</RouterLink>
        <RouterLink v-if="user && user.authority == 0" to="/farmers" @click="menuOpen = false">农户管理</RouterLink>
        <RouterLink v-if="user && (user.authority == 0 || user.authority == 1)" to="/tasks" @click="menuOpen = false">任务管理</RouterLink>
        <RouterLink v-if="user && user.authority >= 0 && user.authority <= 2" to="/orders" @click="menuOpen = false">订单管理</RouterLink>
        <RouterLink v-if="user" to="/statistics" @click="menuOpen = false">数据统计</RouterLink>
        <RouterLink v-if="user" to="/news" @click="menuOpen = false">问题咨询</RouterLink>
        <RouterLink v-if="user" to="/personal" @click="menuOpen = false">个人中心</RouterLink>
        <RouterLink v-if="user" to="#" @click="showLogoutConfirm" class="logout-link">退出登录</RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
    
    <!-- 退出登录确认弹窗 -->
    <el-dialog
      v-model="logoutDialogVisible"
      title="确认退出"
      width="30%"
      center
    >
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
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'

const isMobile = ref(false)
const menuOpen = ref(false)
const user = ref(null)
const router = useRouter()
const logoutDialogVisible = ref(false)

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
}

// 显示退出登录确认弹窗
const showLogoutConfirm = (event) => {
  event.preventDefault()
  logoutDialogVisible.value = true
  if (isMobile.value) {
    menuOpen.value = false
  }
}

// 确认退出登录
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

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  
  // 从本地存储获取用户信息
  const userStr = localStorage.getItem('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize)
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
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
  padding: 15px 5%;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #42b983;
  margin-right: 30px;
}

nav a {
  margin-left: 20px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 4px;
}

nav a:hover {
  background-color: #f0f0f0;
  color: #42b983;
}

nav a.router-link-exact-active {
  color: #42b983;
  font-weight: bold;
  background-color: rgba(66, 185, 131, 0.1);
}

/* 移动端样式 */
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
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  nav:not(.mobile-menu) {
    display: none;
  }
}

@media (min-width: 769px) {
  .mobile-menu {
    display: none !important;
  }
}

main {
  margin-top: 80px; /* 为固定导航栏留出空间 */
  padding: 20px 5%;
}

@media (max-width: 768px) {
  header {
    padding: 10px 20px;
  }

  .logo {
    font-size: 1.2rem;
  }

  main {
    margin-top: 60px;
  }
}

/* 退出登录链接样式 */
.logout-link {
  
  color: #f56c6c !important;
  text-decoration: none;
  transition: all 0.3s ease;
  background-color: white !important;
  border-radius: 4px;
  font-weight: 500;

  
  &:hover {
    background-color: rgba(245, 108, 108, 0.1);
    color: #f56c6c !important;
  }
  

}

/* 移动端退出登录样式 */
.mobile-menu .logout-link {
  margin: 0;
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
  border-radius: 0;
}

/* 弹窗样式 */
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

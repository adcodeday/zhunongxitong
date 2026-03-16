<template>
  <div class="login-page">
    <h2>智慧助农电商平台登录</h2>
    <el-form :model="form" ref="formRef" label-width="80px">
      <el-form-item label="用户名" prop="userName" required>
        <el-input v-model="form.userName" />
      </el-form-item>
      <el-form-item label="密码" prop="passWord" required>
        <el-input v-model="form.passWord" type="password" />
      </el-form-item>
      <el-form-item class="button-group">
        <el-button type="primary" @click="onLogin">登录</el-button>
        <el-button @click="$router.push('/register')" class="button-b">注册账号</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const apiUrl = import.meta.env.VITE_API_URL || ''
const router = useRouter()
const form = ref({
  userName: '',
  passWord: ''
})
const formRef = ref()

const onLogin = async () => {
  try {
    const res = await axios.post(`${apiUrl}/login`, form.value)
    if (res.data.success) {
      ElMessage.success('登录成功')
      // 将用户信息存储到本地存储
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/')
    } else {
      ElMessage.error(res.data.message)
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '登录失败')
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-width: 400px;
  margin: 100px auto;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-left: 300px;
  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #42b983;
  }
}
.button-group {
  display: flex;
  justify-content: space-between;
  .button-b{
  margin-left: 80px;
  
  }
}
</style>
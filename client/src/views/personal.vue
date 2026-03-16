<template>
  <div class="personal-center">
    <h2>个人中心</h2>
    
    <el-card class="user-info-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
          <el-button 
            type="primary" 
            size="small" 
            @click="startEdit" 
            v-if="!isEditing"
          >
            修改信息
          </el-button>
        </div>
      </template>
      
      <div v-if="!isEditing" class="info-display">
        <div class="avatar-container">
          <el-avatar 
            :size="100" 
            :src=userInfo.png 
            @error="handleAvatarError"
          >
            <div>111{{ userInfo.png }}</div>
          </el-avatar>
        </div>
        <div class="info-item">
          <span class="label">用户名：</span>
          <span class="value">{{ userInfo.userName }}</span>
        </div>
        <div class="info-item">
          <span class="label">昵称：</span>
          <span class="value">{{ userInfo.nickName || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="label">电话：</span>
          <span class="value">{{ userInfo.tel || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="label">地区：</span>
          <span class="value">{{ userInfo.local || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="label">身份：</span>
          <el-tag :type="getAuthorityTagType(userInfo.authority)">
            {{ getAuthorityLabel(userInfo.authority) }}
          </el-tag>
        </div>
      </div>
      
      <el-form 
        v-else 
        :model="editForm" 
        :rules="rules" 
        ref="formRef" 
        label-width="80px"
        class="edit-form"
      >
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :action="''"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="editForm.png" :src="editForm.png" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="editForm.userName" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="editForm.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="电话" prop="tel">
          <el-input v-model="editForm.tel" placeholder="请输入电话号码" />
        </el-form-item>
        <el-form-item label="地区" prop="local">
          <el-input v-model="editForm.local" placeholder="请输入所在地区" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveUserInfo">保存</el-button>
          <el-button @click="cancelEdit">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>
      
      <el-form 
        :model="passwordForm" 
        :rules="passwordRules" 
        ref="passwordFormRef" 
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password" 
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="changePassword">修改密码</el-button>
          <el-button @click="resetPasswordForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || ''
const userInfo = ref({})
const isEditing = ref(false)
const formRef = ref(null)
const passwordFormRef = ref(null)

// 编辑表单数据
const editForm = ref({
  userName: '',
  nickName: '',
  tel: '',
  local: '',
  png: ''  // 添加头像字段
})

// 密码表单数据
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = reactive({
  nickName: [
    { max: 20, message: '昵称长度不能超过20个字符', trigger: 'blur' }
  ],
  tel: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  local: [
    { max: 50, message: '地区长度不能超过50个字符', trigger: 'blur' }
  ]
})

// 密码表单验证规则
const passwordRules = reactive({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
})

// 获取权限标签类型
const getAuthorityTagType = (authority) => {
  switch (authority) {
    case 0: return 'danger'
    case 1: return 'success'
    case 2: return 'primary'
    default: return ''
  }
}

// 获取权限标签文本
const getAuthorityLabel = (authority) => {
  switch (authority) {
    case 0: return '管理员'
    case 1: return '农户'
    case 2: return '客户'
    default: return '未知'
  }
}

// 开始编辑
const startEdit = () => {
  editForm.value = { ...userInfo.value }
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
}

// 保存用户信息
const saveUserInfo = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 发送请求更新用户信息
    const response = await axios.put(`${apiUrl}/tables/user/${userInfo.value.id}`, editForm.value)
    if (response.data.success) {
      ElMessage.success('个人信息更新成功')
      
      // 更新本地存储的用户信息
      const updatedUser = { ...userInfo.value, ...editForm.value }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // 更新当前显示的用户信息
      userInfo.value = updatedUser
      isEditing.value = false
    } else {
      ElMessage.error(response.data.message || '更新失败')
    }
  } catch (error) {
    console.error('保存用户信息失败:', error)
    ElMessage.error('表单验证失败或网络错误')
  }
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    
    // 确认是否修改密码
    await ElMessageBox.confirm('确定要修改密码吗？修改后需要重新登录', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 发送请求修改密码
    const response = await axios.post(`${apiUrl}/changePassword`, {
      id: userInfo.value.id,
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    if (response.data.success) {
      ElMessage.success('密码修改成功，请重新登录')
      
      // 清除本地存储的用户信息，跳转到登录页
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else {
      ElMessage.error(response.data.message || '密码修改失败')
    }
  } catch (error) {
    if (error === 'cancel') return
    console.error('修改密码失败:', error)
    ElMessage.error('表单验证失败或网络错误')
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

// 获取用户信息
const getUserInfo = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const userData = JSON.parse(userStr)
    // 设置默认头像
    userInfo.value = {
      ...userData,
      png: userData.png  // 如果没有头像，使用默认头像
     
    }
    console.log(userData)
  }
}

onMounted(() => {
  getUserInfo()
  console.log(userInfo.value.userName)
  console.log(userInfo.value.png)
})

// 处理头像选择
const handleAvatarChange = (file) => {
  // 将文件转换为 base64
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    editForm.value.png = reader.result
  }
}

// 头像上传前的验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('头像必须是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理头像加载错误
const handleAvatarError = () => {
  ElMessage.warning('头像加载失败，使用默认头像')
}
</script>

<style scoped lang="scss">
.personal-center {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  
  h2 {
    margin-bottom: 20px;
    color: #303133;
  }
  
  .user-info-card, .password-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      span {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
  
  .info-display {
    .info-item {
      margin-bottom: 15px;
      display: flex;
      
      .label {
        width: 80px;
        color: #606266;
      }
      
      .value {
        color: #303133;
        font-weight: 500;
      }
    }
  }
  
  .edit-form {
    max-width: 500px;
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    
    .user-info-card, .password-card {
      margin-bottom: 15px;
    }
    
    .info-display {
      .info-item {
        margin-bottom: 10px;
      }
    }
  }
}

.avatar-container {
  text-align: center;
  margin-bottom: 20px;
}

.avatar-uploader {
  text-align: center;
  
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;
    
    &:hover {
      border-color: #409EFF;
    }
  }
}
</style>
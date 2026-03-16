<template>
  <div class="user-manage-container">
    <div class="header">
      <h1 @click="fetchUsers">用户管理</h1>
      <div class="actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名或昵称..."
          class="search-input"
          @input="handleSearch"
          clearable
        >
          <template #append>
            <el-button>搜索</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 用户列表 -->
    <el-table
      :data="filteredUsers"
      style="width: 100%"
      v-loading="loading"
      border
      fit
    >
      <el-table-column prop="id" label="ID" min-width="80" />
      <el-table-column prop="userName" label="用户名" min-width="150" />
      <el-table-column prop="nickName" label="昵称" min-width="180" />
      <el-table-column prop="tel" label="电话" min-width="150" />
      <el-table-column prop="local" label="地区" min-width="150" />
      <el-table-column label="身份" min-width="120">
        <template #default="scope">
          <el-tag :type="getAuthorityTagType(scope.row.authority)">
            {{ getAuthorityLabel(scope.row.authority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="240">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="showEditDialog(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="warning"
            @click="confirmResetPassword(scope.row)"
          >
            重置密码
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="confirmDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="showDialog"
      title="编辑用户"
      width="500px"
    >
      <el-form
        :model="currentUser"
        label-width="80px"
        :rules="rules"
        ref="userFormRef"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="currentUser.userName" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="currentUser.nickName" />
        </el-form-item>
        <el-form-item label="电话" prop="tel">
          <el-input v-model="currentUser.tel" />
        </el-form-item>
        <el-form-item label="地区" prop="local">
          <el-input v-model="currentUser.local" />
        </el-form-item>
        <el-form-item label="权限" prop="authority">
          <el-select v-model="currentUser.authority" placeholder="请选择">
            <el-option :value="1" label="农户" />
            <el-option :value="2" label="客户" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitUser">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="showDeleteConfirm"
      title="确认删除"
      width="400px"
    >
      <span>确定要删除用户 "{{ userToDelete?.userName }}" 吗？此操作不可撤销。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDelete">取消</el-button>
          <el-button type="danger" @click="deleteUser">确定删除</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重置密码确认对话框 -->
    <el-dialog
      v-model="showResetPasswordConfirm"
      title="确认重置密码"
      width="400px"
    >
      <span>确定要将用户 "{{ userToResetPassword?.userName }}" 的密码重置为 123456789 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelResetPassword">取消</el-button>
          <el-button type="warning" @click="resetPassword">确定重置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// API URL
const apiUrl = import.meta.env.VITE_API_URL

// 状态变量
const users = ref([])
const searchKeyword = ref('')
const showDialog = ref(false)
const isEditing = ref(true) // 始终为编辑模式
const currentUser = ref({
  userName: '',
  nickName: '',
  passWord: '',
  tel: '',
  local: '',
  authority: 1
})
const showDeleteConfirm = ref(false)
const userToDelete = ref(null)
const showResetPasswordConfirm = ref(false)
const userToResetPassword = ref(null)
const loading = ref(false)
const userFormRef = ref(null)

// 表单验证规则
const rules = reactive({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  tel: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  local: [
    { required: true, message: '请输入地区', trigger: 'blur' }
  ],
  authority: [
    { required: true, message: '请选择权限', trigger: 'change' }
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

// 过滤用户列表
const filteredUsers = computed(() => {
  if (!searchKeyword.value) {
    return users.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return users.value.filter(user => 
    (user.userName && user.userName.toLowerCase().includes(keyword)) ||
    (user.nickName && user.nickName.toLowerCase().includes(keyword))
  )
})

// 获取用户列表
const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await axios.get(`${apiUrl}/tables/user`)
    if (response.data.data) {
      users.value = response.data.data
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 显示编辑用户对话框
const showEditDialog = (user) => {
  currentUser.value = { ...user }
  showDialog.value = true
  // 重置表单验证
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
}

// 提交用户表单
const submitUser = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 编辑用户
        await axios.put(`${apiUrl}/tables/user/${currentUser.value.id}`, currentUser.value)
        const index = users.value.findIndex(u => u.id === currentUser.value.id)
        if (index !== -1) {
          users.value[index] = { ...currentUser.value }
        }
        ElMessage.success('用户信息更新成功')
        showDialog.value = false
      } catch (error) {
        console.error('保存用户失败:', error)
        ElMessage.error('操作失败，请重试')
      }
    }
  })
}

// 确认删除用户
const confirmDelete = (user) => {
  userToDelete.value = user
  showDeleteConfirm.value = true
}

// 取消删除
const cancelDelete = () => {
  showDeleteConfirm.value = false
  userToDelete.value = null
}

// 删除用户
const deleteUser = async () => {
  if (!userToDelete.value) return
  
  try {
    await axios.delete(`${apiUrl}/tables/user/${userToDelete.value.id}`)
    users.value = users.value.filter(u => u.id !== userToDelete.value.id)
    showDeleteConfirm.value = false
    userToDelete.value = null
    ElMessage.success('用户删除成功')
  } catch (error) {
    console.error('删除用户失败:', error)
    ElMessage.error('删除失败，请重试')
  }
}


// 组件挂载时获取用户列表
onMounted(() => {
  fetchUsers()
})

// 确认重置密码
const confirmResetPassword = (user) => {
  userToResetPassword.value = user
  showResetPasswordConfirm.value = true
}

// 取消重置密码
const cancelResetPassword = () => {
  showResetPasswordConfirm.value = false
  userToResetPassword.value = null
}

// 重置密码
const resetPassword = async () => {
  if (!userToResetPassword.value) return
  
  try {
    const userWithResetPassword = {
      ...userToResetPassword.value,
      passWord: '123456789'
    }
    
    await axios.put(`${apiUrl}/tables/user/${userToResetPassword.value.id}`, userWithResetPassword)
    
    // 更新本地用户列表
    const index = users.value.findIndex(u => u.id === userToResetPassword.value.id)
    if (index !== -1) {
      users.value[index] = { ...userWithResetPassword }
    }
    
    showResetPasswordConfirm.value = false
    userToResetPassword.value = null
    ElMessage.success('密码重置成功')
  } catch (error) {
    console.error('重置密码失败:', error)
    ElMessage.error('重置密码失败，请重试')
  }
}
</script>

<style scoped lang="scss">
.user-manage-container {
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
  width: 110%;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h1 {
      margin: 0;
      font-size: 24px;
      cursor: pointer;
      
      &:hover {
        color: #409EFF;
      }
    }
    
    .actions {
      display: flex;
      gap: 15px;
      align-items: center;
      
      .search-input {
        width: 300px;
      }
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .el-table {
    margin-bottom: 20px;
  }
}

@media screen and (max-width: 1200px) {
  .user-manage-container {
    padding: 15px;
  }
}

@media screen and (max-width: 768px) {
  .user-manage-container {
    padding: 10px;
    
    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      
      .actions {
        width: 100%;
        
        .search-input {
          width: 100%;
        }
      }
    }
  }
}
</style>
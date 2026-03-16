<template>
  <div class="register-container">
    <el-card class="register-form">
      <template #header>
        <h2 class="form-header">用户注册</h2>
      </template>
      
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-position="top" 
        status-icon
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="passWord">
          <el-input v-model="form.passWord" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password></el-input>
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入昵称"></el-input>
        </el-form-item>
        
        <el-form-item label="电话" prop="tel">
          <el-input v-model="form.tel" placeholder="请输入电话号码"></el-input>
        </el-form-item>
        
        <el-form-item label="地区" prop="local">
          <el-input v-model="form.local" placeholder="请输入所在地区"></el-input>
        </el-form-item>
        
        <el-form-item label="用户类型" prop="authority">
          <el-radio-group v-model="form.authority">
            <el-radio :label="1">农户</el-radio>
            <el-radio :label="2">客户</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item>
          <div class="form-actions">
            <el-button type="primary" @click="handleRegister" :loading="isSubmitting">注册</el-button>
            <el-button @click="goToLogin" class="aa">已有账号？去登录</el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <el-alert
        v-if="globalError"
        :title="globalError"
        type="error"
        show-icon
        :closable="false"
        style="margin-top: 15px"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const apiUrl = import.meta.env.VITE_API_URL || '';
const router = useRouter();
const formRef = ref(null);

// 表单数据
const form = reactive({
  userName: '',
  passWord: '',
  confirmPassword: '',
  nickName: '',
  tel: '',
  local: '',
  authority: 2  // 默认选择客户
});

// 表单验证规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6个字符'));
  } else {
    if (form.confirmPassword !== '') {
      formRef.value.validateField('confirmPassword');
    }
    callback();
  }
};

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== form.passWord) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

const validatePhone = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入手机号码'));
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入有效的手机号码'));
  } else {
    callback();
  }
};

const rules = reactive({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3个字符', trigger: 'blur' }
  ],
  passWord: [
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  tel: [
    { validator: validatePhone, trigger: 'blur' }
  ],
  local: [
    { required: true, message: '请输入地区', trigger: 'blur' }
  ],
  authority: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
});

const globalError = ref('');
const isSubmitting = ref(false);

// 注册处理
const handleRegister = async () => {
  if (isSubmitting.value) return;
  
  try {
    await formRef.value.validate();
    
    isSubmitting.value = true;
    globalError.value = '';
    
    const response = await axios.post(`${apiUrl}/register`, {
      userName: form.userName,
      passWord: form.passWord,
      nickName: form.nickName,
      tel: form.tel,
      local: form.local,
      authority: form.authority
    });
    
    if (response.data.success) {
      ElMessage({
        message: '注册成功！',
        type: 'success'
      });
      router.push('/login');
    } else {
      globalError.value = response.data.message || '注册失败，请稍后再试';
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      return; // 表单验证错误，已经显示在表单中
    }
    
    console.error('注册请求失败:', error);
    if (error.response && error.response.data && error.response.data.message) {
      globalError.value = error.response.data.message;
    } else {
      globalError.value = '注册失败，请稍后再试';
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 跳转到登录页
const goToLogin = () => {
  router.push('/login');
};

onMounted(() => {
  // 可以在这里添加初始化逻辑
});
</script>

<style scoped lang=scss>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  margin-left: 300px;
  .register-form {
    width: 100%;
    min-width: 600px;
    
    .form-header {
      text-align: center;
      margin: 0;
      color: #303133;
      font-weight: 500;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      width: 300px;
      margin-left: 20px;
      .aa{
        margin-right: -200px;
      }
      .el-button {
        flex: 1;
        
        &:first-child {
          margin-right: 10px;
        }
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .register-container {
    padding: 10px;
    
    .register-form {
      max-width: 100%;
    }
    
    .form-actions {
      flex-direction: column;
      
      .el-button {
        margin-bottom: 10px;
        
        &:first-child {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
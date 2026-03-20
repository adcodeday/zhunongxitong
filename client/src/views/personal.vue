<template>
  <div class="personal-page">
    <!-- 顶部背景Banner + 头像 -->
    <div class="profile-banner">
      <div class="banner-bg"></div>
      <div class="profile-hero">
        <div class="avatar-wrap">
          <img
            v-if="userInfo.png"
            :src="userInfo.png"
            class="avatar-img"
            @error="handleAvatarError"
          />
          <div v-else class="avatar-placeholder">
            {{ (userInfo.nickName || userInfo.userName || '?')[0] }}
          </div>
          <label class="avatar-edit-btn" title="更换头像">
            📷
            <input type="file" accept="image/*" style="display:none" @change="onAvatarFile" />
          </label>
        </div>
        <div class="profile-meta">
          <div class="profile-name">{{ userInfo.nickName || userInfo.userName || '未知用户' }}</div>
          <div class="profile-username">@{{ userInfo.userName }}</div>
          <div class="profile-tags">
            <span class="role-tag" :class="'role-' + userInfo.authority">
              {{ getAuthorityLabel(userInfo.authority) }}
            </span>
            <span class="location-tag" v-if="userInfo.local">📍 {{ userInfo.local }}</span>
            <span class="tel-tag" v-if="userInfo.tel">📞 {{ userInfo.tel }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="personal-body">
      <!-- 左侧：信息卡片 + 安全 -->
      <div class="left-col">

        <!-- 基本信息卡 -->
        <div class="info-card">
          <div class="card-head">
            <span class="card-head-title">基本信息</span>
            <button class="edit-toggle-btn" @click="toggleEdit" v-if="!isEditing">✏️ 编辑</button>
            <div v-else class="edit-actions">
              <button class="save-btn" @click="saveUserInfo">保存</button>
              <button class="cancel-btn" @click="cancelEdit">取消</button>
            </div>
          </div>

          <!-- 展示模式 -->
          <div v-if="!isEditing" class="info-display">
            <div class="info-row">
              <span class="info-label">用户名</span>
              <span class="info-val">{{ userInfo.userName || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">昵称</span>
              <span class="info-val">{{ userInfo.nickName || '未设置' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">手机号</span>
              <span class="info-val">{{ userInfo.tel || '未设置' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">所在地</span>
              <span class="info-val">{{ userInfo.local || '未设置' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">身份</span>
              <span class="role-tag" :class="'role-' + userInfo.authority">
                {{ getAuthorityLabel(userInfo.authority) }}
              </span>
            </div>
          </div>

          <!-- 编辑模式 -->
          <el-form v-else :model="editForm" :rules="rules" ref="formRef" label-width="0" class="edit-form">
            <div class="form-field">
              <label>昵称</label>
              <el-form-item prop="nickName">
                <el-input v-model="editForm.nickName" placeholder="请输入昵称" />
              </el-form-item>
            </div>
            <div class="form-field">
              <label>手机号</label>
              <el-form-item prop="tel">
                <el-input v-model="editForm.tel" placeholder="请输入手机号" />
              </el-form-item>
            </div>
            <div class="form-field">
              <label>所在地</label>
              <el-form-item prop="local">
                <el-input v-model="editForm.local" placeholder="请输入所在地" />
              </el-form-item>
            </div>
          </el-form>
        </div>

        <!-- 账号安全卡 -->
        <div class="info-card security-card">
          <div class="card-head">
            <span class="card-head-title">账号安全</span>
          </div>
          <div class="security-item" @click="showPwdPanel = !showPwdPanel">
            <div class="sec-left">
              <span class="sec-icon">🔒</span>
              <div>
                <div class="sec-title">登录密码</div>
                <div class="sec-sub">建议定期更换密码保障账号安全</div>
              </div>
            </div>
            <span class="sec-arrow" :class="{ open: showPwdPanel }">›</span>
          </div>

          <div class="pwd-panel" v-show="showPwdPanel">
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="0">
              <div class="form-field">
                <label>原密码</label>
                <el-form-item prop="oldPassword">
                  <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
                </el-form-item>
              </div>
              <div class="form-field">
                <label>新密码</label>
                <el-form-item prop="newPassword">
                  <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="至少6位" />
                </el-form-item>
              </div>
              <div class="form-field">
                <label>确认新密码</label>
                <el-form-item prop="confirmPassword">
                  <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="再次输入新密码" />
                </el-form-item>
              </div>
              <button class="save-btn full-btn" @click="changePassword">确认修改</button>
            </el-form>
          </div>
        </div>
      </div>

      <!-- 右侧：统计 + 活动 -->
      <div class="right-col">
        <!-- 数据统计 -->
        <div class="info-card stats-card">
          <div class="card-head">
            <span class="card-head-title">我的数据</span>
          </div>
          <div class="stats-grid">
            <div class="stat-block">
              <div class="stat-num">{{ stats.orders }}</div>
              <div class="stat-lbl">累计订单</div>
            </div>
            <div class="stat-block">
              <div class="stat-num">¥{{ stats.total }}</div>
              <div class="stat-lbl">累计消费</div>
            </div>
            <div class="stat-block">
              <div class="stat-num">{{ stats.tasks }}</div>
              <div class="stat-lbl">参与任务</div>
            </div>
            <div class="stat-block">
              <div class="stat-num">{{ stats.days }}</div>
              <div class="stat-lbl">注册天数</div>
            </div>
          </div>
        </div>

        <!-- 最近活动 -->
        <div class="info-card activity-card">
          <div class="card-head">
            <span class="card-head-title">最近活动</span>
          </div>
          <div class="activity-list">
            <div class="act-item" v-for="(act, i) in activities" :key="i">
              <span class="act-icon">{{ act.icon }}</span>
              <div class="act-body">
                <div class="act-title">{{ act.title }}</div>
                <div class="act-time">{{ act.time }}</div>
              </div>
              <span class="act-status" :class="act.type">{{ act.status }}</span>
            </div>
          </div>
        </div>

        <!-- 快捷入口 -->
        <div class="info-card shortcut-card">
          <div class="card-head">
            <span class="card-head-title">快捷入口</span>
          </div>
          <div class="shortcut-grid">
            <router-link to="/orders" class="shortcut-item">
              <span class="sc-icon">📦</span>
              <span class="sc-name">我的订单</span>
            </router-link>
            <router-link to="/tasks" class="shortcut-item">
              <span class="sc-icon">📋</span>
              <span class="sc-name">任务中心</span>
            </router-link>
            <router-link to="/" class="shortcut-item">
              <span class="sc-icon">🛒</span>
              <span class="sc-name">去购物</span>
            </router-link>
            <router-link to="/news" class="shortcut-item">
              <span class="sc-icon">💬</span>
              <span class="sc-name">问题咨询</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || ''
const userInfo = ref({})
const isEditing = ref(false)
const showPwdPanel = ref(false)
const formRef = ref(null)
const passwordFormRef = ref(null)

const editForm = ref({ nickName: '', tel: '', local: '', png: '' })
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })

const rules = reactive({
  nickName: [{ max: 20, message: '昵称长度不能超过20个字符', trigger: 'blur' }],
  tel: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
  local: [{ max: 50, message: '地区长度不能超过50个字符', trigger: 'blur' }],
})

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
        if (value !== passwordForm.value.newPassword) callback(new Error('两次输入的密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
})

// 静态统计和活动数据
const stats = { orders: 12, total: '2,388', tasks: 5, days: 86 }

const activities = [
  { icon: '📦', title: '购买了有机草莓 x2', time: '2025-07-18 14:30', status: '已支付', type: 'success' },
  { icon: '📋', title: '接取了农田除草任务', time: '2025-07-16 10:00', status: '进行中', type: 'info' },
  { icon: '📦', title: '购买了云南蜂蜜礼盒', time: '2025-07-14 09:15', status: '已完成', type: 'success' },
  { icon: '💬', title: '咨询了农产品问题', time: '2025-07-12 16:40', status: '已回复', type: 'success' },
  { icon: '📦', title: '购买了东北大米 5kg', time: '2025-07-10 11:20', status: '已发货', type: 'warning' },
]

const getAuthorityLabel = (authority) => {
  return { 0: '管理员', 1: '农户', 2: '客户' }[authority] ?? '未知'
}

const getUserInfo = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) userInfo.value = JSON.parse(userStr)
}

const toggleEdit = () => {
  editForm.value = { ...userInfo.value }
  isEditing.value = true
}

const cancelEdit = () => { isEditing.value = false }

const saveUserInfo = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const response = await axios.put(`${apiUrl}/tables/user/${userInfo.value.id}`, editForm.value)
    if (response.data.success) {
      ElMessage.success('个人信息更新成功')
      const updated = { ...userInfo.value, ...editForm.value }
      localStorage.setItem('user', JSON.stringify(updated))
      userInfo.value = updated
      isEditing.value = false
    } else {
      ElMessage.error(response.data.message || '更新失败')
    }
  } catch (e) {
    console.error(e)
  }
}

const changePassword = async () => {
  if (!passwordFormRef.value) return
  try {
    await passwordFormRef.value.validate()
    await ElMessageBox.confirm('确定要修改密码吗？修改后需要重新登录', '提示', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    const response = await axios.post(`${apiUrl}/changePassword`, {
      id: userInfo.value.id,
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    if (response.data.success) {
      ElMessage.success('密码修改成功，请重新登录')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else {
      ElMessage.error(response.data.message || '密码修改失败')
    }
  } catch (e) {
    if (e === 'cancel') return
    console.error(e)
  }
}

const handleAvatarError = () => { userInfo.value.png = '' }

const onAvatarFile = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return ElMessage.error('请选择图片文件')
  if (file.size > 2 * 1024 * 1024) return ElMessage.error('图片不能超过2MB')
  const reader = new FileReader()
  reader.onload = async () => {
    try {
      const base64 = reader.result
      await axios.put(`${apiUrl}/tables/user/${userInfo.value.id}`, { png: base64 })
      userInfo.value.png = base64
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      stored.png = base64
      localStorage.setItem('user', JSON.stringify(stored))
      ElMessage.success('头像更新成功')
    } catch (e) {
      ElMessage.error('头像上传失败')
    }
  }
  reader.readAsDataURL(file)
}

onMounted(getUserInfo)
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

* { box-sizing: border-box; }

.personal-page {
  margin-top: -20px;
  margin-left: -5vw;
  margin-right: -5vw;
  width: 100vw;
  max-width: 100vw;
  box-sizing: border-box;
}
// ── Banner ──
.profile-banner {
  position: relative;
  padding: 0 0 0;
}
.banner-bg {
  height: 160px;
  background: linear-gradient(135deg, #1a4a2e 0%, #2d8a5e 50%, #42b983 100%);
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
}
.profile-hero {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding: 0 32px 24px;
  margin-top: -60px;
  position: relative;
  z-index: 1;
}
.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.avatar-img, .avatar-placeholder {
  width: 96px; height: 96px; border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  object-fit: cover;
}
.avatar-placeholder {
  background: linear-gradient(135deg, #42b983, #2d8a5e);
  display: flex; align-items: center; justify-content: center;
  font-size: 36px; font-weight: 700; color: white;
}
.avatar-edit-btn {
  position: absolute; bottom: 2px; right: 2px;
  width: 28px; height: 28px; border-radius: 50%;
  background: white; border: 2px solid #eee;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: all 0.2s;
  &:hover { background: #42b983; border-color: #42b983; }
}
.profile-meta { padding-bottom: 4px; }
.profile-name { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
.profile-username { font-size: 13px; color: #888; margin-bottom: 8px; }
.profile-tags { display: flex; gap: 8px; flex-wrap: wrap; }

// ── Role Tags ──
.role-tag {
  display: inline-flex; align-items: center;
  padding: 2px 10px; border-radius: 12px;
  font-size: 12px; font-weight: 700;
}
.role-0 { background: #fff0f0; color: #e85d5d; }
.role-1 { background: #e6f9f0; color: #2d8a5e; }
.role-2 { background: #e8f0ff; color: #4466cc; }
.location-tag, .tel-tag {
  font-size: 12px; color: #888;
  background: #f5f5f5; padding: 2px 8px; border-radius: 10px;
}

// ── Body Layout ──
.personal-body {
  display: flex;
  gap: 16px;
  padding: 20px 32px 40px;
  max-width: 1200px;
  margin: 0 auto;
}
.left-col { width: 340px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }
.right-col { flex: 1; display: flex; flex-direction: column; gap: 16px; }

// ── Info Card ──
.info-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.card-head-title { font-size: 15px; font-weight: 700; color: #1a1a1a; }

.edit-toggle-btn, .save-btn, .cancel-btn {
  border: none; cursor: pointer; border-radius: 8px;
  font-size: 13px; font-weight: 600; padding: 5px 14px;
  font-family: inherit; transition: all 0.15s;
}
.edit-toggle-btn { background: #f3f6f3; color: #42b983; &:hover { background: #e6f9f0; } }
.save-btn { background: #42b983; color: white; &:hover { background: #2d8a5e; } }
.cancel-btn { background: #f5f5f5; color: #666; margin-left: 8px; &:hover { background: #eee; } }
.edit-actions { display: flex; }

// ── Info Display ──
.info-display { display: flex; flex-direction: column; gap: 12px; }
.info-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f8f8f8; &:last-child { border-bottom: none; } }
.info-label { font-size: 13px; color: #999; }
.info-val { font-size: 14px; color: #333; font-weight: 500; }

// ── Edit Form ──
.edit-form { .el-form-item { margin-bottom: 0; } }
.form-field {
  margin-bottom: 14px;
  label { font-size: 12px; color: #999; display: block; margin-bottom: 5px; }
}
.full-btn { width: 100%; padding: 10px; margin-top: 4px; }

// ── Security ──
.security-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0; cursor: pointer; border-radius: 8px;
  transition: background 0.15s;
  &:hover { background: #f8f8f8; padding: 10px 8px; margin: 0 -8px; }
}
.sec-left { display: flex; align-items: center; gap: 12px; }
.sec-icon { font-size: 22px; }
.sec-title { font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 2px; }
.sec-sub { font-size: 12px; color: #aaa; }
.sec-arrow {
  font-size: 20px; color: #bbb; transition: transform 0.2s;
  &.open { transform: rotate(90deg); }
}
.pwd-panel {
  margin-top: 16px; padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

// ── Stats ──
.stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
}
.stat-block {
  text-align: center; padding: 16px 8px;
  background: #f8faf8; border-radius: 10px;
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); background: #e6f9f0; }
}
.stat-num { font-size: 22px; font-weight: 700; color: #42b983; margin-bottom: 4px; }
.stat-lbl { font-size: 11px; color: #aaa; }

// ── Activity ──
.activity-list { display: flex; flex-direction: column; }
.act-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 0; border-bottom: 1px solid #f5f5f5;
  &:last-child { border-bottom: none; }
}
.act-icon { font-size: 22px; flex-shrink: 0; }
.act-body { flex: 1; }
.act-title { font-size: 13px; color: #333; font-weight: 500; margin-bottom: 2px; }
.act-time { font-size: 11px; color: #bbb; }
.act-status {
  font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px; white-space: nowrap;
}
.success { background: #e6f9f0; color: #2d8a5e; }
.info { background: #e8f0ff; color: #4466cc; }
.warning { background: #fff3e0; color: #e08000; }

// ── Shortcuts ──
.shortcut-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.shortcut-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px 8px; border-radius: 10px; background: #f8faf8;
  text-decoration: none; transition: all 0.15s;
  &:hover { background: #e6f9f0; transform: translateY(-2px); }
}
.sc-icon { font-size: 24px; }
.sc-name { font-size: 12px; color: #555; font-weight: 500; }

// ── Responsive ──
@media (max-width: 900px) {
  .personal-body { flex-direction: column; padding: 16px; }
  .left-col { width: 100%; }
  .profile-hero { padding: 0 16px 20px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
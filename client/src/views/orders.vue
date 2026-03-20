<template>
  <div class="orders-manage">
    <div class="header">
      <h2>订单管理</h2>
      <div class="actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单ID、商品、买家、卖家..."
          class="search-input"
          clearable
        />
        <el-button type="primary" @click="handleAdd" v-if="isAdmin">新增订单</el-button>
      </div>
    </div>

    <!-- 统计卡片（非管理员） -->
    <div class="stat-cards" v-if="!isAdmin">
      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div class="stat-info">
          <div class="stat-value">{{ userOrders.length }}</div>
          <div class="stat-label">全部订单</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ userOrders.filter(o => o.order_status == 3).length }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-value">¥{{ userOrders.reduce((s, o) => s + Number(o.order_amount || 0), 0).toFixed(2) }}</div>
          <div class="stat-label">累计金额</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-value">{{ userOrders.filter(o => o.order_status == 0).length }}</div>
          <div class="stat-label">待支付</div>
        </div>
      </div>
    </div>

    <!-- 管理员视图：用户列表 + 展开订单 -->
    <el-table
      v-if="isAdmin"
      :data="filteredUsers"
      border
      v-loading="loading"
      stripe
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="orders-list">
            <h4>{{ props.row.nickName || props.row.userName }} 的订单列表</h4>
            <el-empty v-if="getUserOrders(props.row.id).length === 0" description="暂无订单" :image-size="60" />
            <el-table v-else :data="getUserOrders(props.row.id)" border stripe>
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="order_id" label="订单ID" width="100" sortable />
              <el-table-column prop="goods" label="商品信息" min-width="150" show-overflow-tooltip />
              <el-table-column prop="buyer" label="买家" width="120" show-overflow-tooltip />
              <el-table-column prop="seller" label="卖家" width="120" show-overflow-tooltip />
              <el-table-column label="订单时间" width="160">
                <template #default="{ row }">{{ formatDate(row.order_time) }}</template>
              </el-table-column>
              <el-table-column label="金额" width="100">
                <template #default="{ row }">
                  <span class="amount">¥{{ Number(row.order_amount).toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.order_status)" size="small">
                    {{ getStatusText(row.order_status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="用户名" width="160">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="32" :src="row.png || ''" icon="User" />
            <span>{{ row.nickName || row.userName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="tel" label="电话" width="140" />
      <el-table-column prop="local" label="地区" width="120" show-overflow-tooltip />
      <el-table-column label="订单统计" min-width="200">
        <template #default="{ row }">
          <span>共 <b>{{ getUserOrders(row.id).length }}</b> 单 &nbsp; 合计 <b class="amount">¥{{ getUserOrders(row.id).reduce((s, o) => s + Number(o.order_amount || 0), 0).toFixed(2) }}</b></span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleAddOrderForUser(row)">新增订单</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 普通用户视图：我的订单卡片 -->
    <div v-else>
      <el-empty v-if="filteredUserOrders.length === 0" description="暂无订单记录" />
      <div v-else class="order-cards">
        <div class="order-card" v-for="order in filteredUserOrders" :key="order.order_id">
          <div class="card-header">
            <span class="order-id">订单号：{{ order.order_id }}</span>
            <el-tag :type="getStatusType(order.order_status)" size="small">
              {{ getStatusText(order.order_status) }}
            </el-tag>
          </div>
          <div class="card-body">
            <div class="card-row"><span class="label">🛍 商品</span><span class="value">{{ order.goods || '—' }}</span></div>
            <div class="card-row"><span class="label">🏪 卖家</span><span class="value">{{ order.seller || '—' }}</span></div>
            <div class="card-row"><span class="label">🕐 时间</span><span class="value">{{ formatDate(order.order_time) }}</span></div>
            <div class="card-row"><span class="label">💰 金额</span><span class="value amount">¥{{ Number(order.order_amount).toFixed(2) }}</span></div>
          </div>
        </div>
      </div>
      <div class="pagination-container" v-if="filteredUserOrders.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          :total="filteredUserOrders.length"
        />
      </div>
    </div>

    <!-- 新增/编辑订单弹窗 -->
    <el-dialog :title="dialogType === 'add' ? '新增订单' : '编辑订单'" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="用户" prop="user_id" v-if="isAdmin">
          <el-select v-model="form.user_id" placeholder="请选择用户" filterable style="width:100%">
            <el-option v-for="u in users" :key="u.id" :label="`${u.nickName || u.userName} (ID:${u.id})`" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品信息" prop="goods">
          <el-input v-model="form.goods" />
        </el-form-item>
        <el-form-item label="买家" prop="buyer">
          <el-input v-model="form.buyer" />
        </el-form-item>
        <el-form-item label="卖家" prop="seller">
          <el-input v-model="form.seller" />
        </el-form-item>
        <el-form-item label="订单时间" prop="order_time">
          <el-date-picker v-model="form.order_time" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" style="width:100%" />
        </el-form-item>
        <el-form-item label="订单金额" prop="order_amount">
          <el-input-number v-model="form.order_amount" :min="0" :precision="2" style="width:100%" />
        </el-form-item>
        <el-form-item label="订单状态" prop="order_status">
          <el-select v-model="form.order_status" style="width:100%">
            <el-option :value="0" label="未支付" />
            <el-option :value="1" label="已支付" />
            <el-option :value="2" label="已发货" />
            <el-option :value="3" label="已完成" />
            <el-option :value="4" label="已取消" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const orders = ref([])
const users = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const currentUser = ref(null)

const form = ref({
  order_id: null,
  user_id: null,
  goods: '',
  buyer: '',
  seller: '',
  order_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
  order_amount: 0,
  order_status: 0
})

const rules = ref({
  user_id: [{ required: true, message: '请选择用户', trigger: 'change' }],
  goods: [{ required: true, message: '请输入商品信息', trigger: 'blur' }],
  buyer: [{ required: true, message: '请输入买家', trigger: 'blur' }],
  seller: [{ required: true, message: '请输入卖家', trigger: 'blur' }],
  order_time: [{ required: true, message: '请选择时间', trigger: 'change' }],
  order_amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  order_status: [{ required: true, message: '请选择状态', trigger: 'change' }]
})

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) currentUser.value = JSON.parse(userStr)
}

// 权限：0管理员 1农户 2客户
const isAdmin = computed(() => currentUser.value?.authority === 0)

// 当前用户的订单
const userOrders = computed(() => {
  if (!currentUser.value) return []
  return orders.value.filter(o => o.user_id === currentUser.value.id)
})

// 搜索过滤后的我的订单
const filteredUserOrders = computed(() => {
  const keyword = searchKeyword.value.toLowerCase()
  if (!keyword) return userOrders.value
  return userOrders.value.filter(o =>
    o.order_id?.toString().includes(keyword) ||
    o.goods?.toLowerCase().includes(keyword) ||
    o.buyer?.toLowerCase().includes(keyword) ||
    o.seller?.toLowerCase().includes(keyword)
  )
})

// 管理员搜索过滤用户
const filteredUsers = computed(() => {
  const keyword = searchKeyword.value.toLowerCase()
  if (!keyword) return users.value
  return users.value.filter(u =>
    u.id?.toString().includes(keyword) ||
    u.userName?.toLowerCase().includes(keyword) ||
    u.nickName?.toLowerCase().includes(keyword)
  )
})

const getUserOrders = (userId) => orders.value.filter(o => o.user_id === userId)

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

const getStatusText = (status) => {
  return { 0: '未支付', 1: '已支付', 2: '已发货', 3: '已完成', 4: '已取消' }[status] || '未知'
}

const getStatusType = (status) => {
  return { 0: 'warning', 1: 'primary', 2: 'info', 3: 'success', 4: 'danger' }[status] || ''
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await axios.get(`${apiUrl}/tables/orders`)
    orders.value = res.data.data || []
  } catch (e) {
    ElMessage.error('获取订单失败')
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const res = await axios.get(`${apiUrl}/tables/user`)
    users.value = res.data.data || []
  } catch (e) {
    console.error('获取用户列表失败')
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    order_id: null, user_id: null, goods: '', buyer: '', seller: '',
    order_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    order_amount: 0, order_status: 0
  }
  dialogVisible.value = true
}

const handleAddOrderForUser = (user) => {
  dialogType.value = 'add'
  form.value = {
    order_id: null,
    user_id: user.id,
    goods: '',
    buyer: user.nickName || user.userName,
    seller: '',
    order_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    order_amount: 0,
    order_status: 0
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这个订单吗？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`${apiUrl}/tables/orders/${row.order_id}`)
      ElMessage.success('删除成功')
      fetchOrders()
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (dialogType.value === 'add') {
        // 新增不传 order_id，由数据库自增
        await axios.post(`${apiUrl}/tables/orders`, {
          user_id: form.value.user_id,
          goods: form.value.goods,
          buyer: form.value.buyer,
          seller: form.value.seller,
          order_time: form.value.order_time,
          order_amount: form.value.order_amount,
          order_status: form.value.order_status
        })
        ElMessage.success('添加成功')
      } else {
        await axios.put(`${apiUrl}/tables/orders/${form.value.order_id}`, {
          user_id: form.value.user_id,
          goods: form.value.goods,
          buyer: form.value.buyer,
          seller: form.value.seller,
          order_time: form.value.order_time,
          order_amount: form.value.order_amount,
          order_status: form.value.order_status
        })
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      fetchOrders()
    } catch (e) {
      ElMessage.error('操作失败')
    }
  })
}

onMounted(() => {
  getCurrentUser()
  fetchOrders()
  fetchUsers()
})
</script>

<style scoped lang="scss">
.orders-manage {
  margin-top: -20px;
  margin-left: -5vw;
  margin-right: -5vw;
  padding: 24px 5vw;
  width: 100vw;
  max-width: 100vw;
  box-sizing: border-box;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    h2 { margin: 0; font-size: 22px; color: #333; }
    .actions { display: flex; gap: 10px; }
    .search-input { width: 300px; }
  }

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .stat-card {
      background: #fff;
      border-radius: 10px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      transition: transform 0.2s;
      &:hover { transform: translateY(-2px); }
      .stat-icon { font-size: 36px; }
      .stat-value { font-size: 24px; font-weight: bold; color: #42b983; }
      .stat-label { font-size: 13px; color: #999; margin-top: 4px; }
    }
  }

  .order-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;

    .order-card {
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 18px;
        background: #f8f9fa;
        border-bottom: 1px solid #eee;
        .order-id { font-size: 13px; color: #666; font-weight: 500; }
      }

      .card-body {
        padding: 16px 18px;
        .card-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          &:last-child { margin-bottom: 0; }
          .label { font-size: 13px; color: #999; }
          .value { font-size: 14px; color: #333; font-weight: 500; }
        }
      }
    }
  }

  .amount { color: #e6423a; font-weight: bold; }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .orders-list {
    padding: 16px 24px;
    background: #f8faff;
    h4 { margin: 0 0 12px; color: #409EFF; font-size: 15px; }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
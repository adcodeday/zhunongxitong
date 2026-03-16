<template>
  <div class="orders-manage">
    <div class="header">
      <h2>订单管理</h2>
      <div class="actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单或商品信息..."
          class="search-input"
          clearable
        >
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
        <el-button type="primary" @click="handleAdd" v-if="isAdmin">新增订单</el-button>
      </div>
    </div>

    <!-- 管理员视图：用户列表表格 -->
    <el-table 
      v-if="isAdmin" 
      :data="filteredUsers" 
      border 
      v-loading="loading" 
      class="user-table"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="orders-list">
            <h4>订单列表</h4>
            <el-table :data="getUserOrders(props.row.id)" border class="inner-table">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="order_id" label="订单ID" width="100" sortable />
              <el-table-column prop="goods" label="商品信息" width="150">
                <template #default="{ row }">
                  {{ row.goods || '未指定商品' }}
                </template>
              </el-table-column>
              <el-table-column prop="buyer" label="买家" width="120" v-if="isAdmin || isCustomer">
                <template #default="{ row }">
                  {{ row.buyer || '未指定买家' }}
                </template>
              </el-table-column>
              <el-table-column prop="seller" label="卖家" width="120" v-if="isAdmin || isFarmer">
                <template #default="{ row }">
                  {{ row.seller || '未指定卖家' }}
                </template>
              </el-table-column>
              <el-table-column prop="order_time" label="订单时间" width="180" sortable>
                <template #default="{ row }">
                  {{ formatDate(row.order_time) }}
                </template>
              </el-table-column>
              <el-table-column prop="order_amount" label="订单金额" width="120" sortable>
                <template #default="{ row }">
                  ¥{{ row.order_amount }}
                </template>
              </el-table-column>
              <el-table-column prop="order_status" label="订单状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.order_status)">
                    {{ getStatusText(row.order_status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="id" label="用户ID" width="100" sortable />
      <el-table-column label="用户信息" width="180">
        <template #default="{ row }">
          <div>
            <p><strong>用户名:</strong> {{ row.userName || '未知' }}</p>
            <p><strong>昵称:</strong> {{ row.nickName || '未知' }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="联系方式" width="180">
        <template #default="{ row }">
          <div>
            <p><strong>电话:</strong> {{ row.tel || '未设置' }}</p>
            <p><strong>地区:</strong> {{ row.local || '未设置' }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="订单统计" width="180">
        <template #default="{ row }">
          <div>
            <p><strong>订单数量:</strong> {{ getUserOrdersCount(row.id) }}</p>
            <p><strong>订单总额:</strong> ¥{{ getUserOrdersTotal(row.id) }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleAddOrderForUser(row)">新增订单</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 普通用户视图：订单列表 -->
    <el-table 
      v-else 
      :data="filteredUserOrders" 
      border 
      v-loading="loading" 
      class="order-table"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="order-detail">
            <h4>订单详情</h4>
            <p><strong>订单ID:</strong> {{ props.row.order_id }}</p>
            <p><strong>商品信息:</strong> {{ props.row.goods || '未指定商品' }}</p>
            <p v-if="isAdmin || isCustomer"><strong>买家:</strong> {{ props.row.buyer || '未指定买家' }}</p>
            <p v-if="isAdmin || isFarmer"><strong>卖家:</strong> {{ props.row.seller || '未指定卖家' }}</p>
            <p><strong>订单时间:</strong> {{ formatDate(props.row.order_time) }}</p>
            <p><strong>订单金额:</strong> ¥{{ props.row.order_amount }}</p>
            <p><strong>订单状态:</strong> {{ getStatusText(props.row.order_status) }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="order_id" label="订单ID" width="100" sortable />
      <el-table-column prop="goods" label="商品信息" width="150">
        <template #default="{ row }">
          {{ row.goods || '未指定商品' }}
        </template>
      </el-table-column>
      <el-table-column prop="buyer" label="买家" width="120" v-if="isAdmin || isCustomer">
        <template #default="{ row }">
          {{ row.buyer || '未指定买家' }}
        </template>
      </el-table-column>
      <el-table-column prop="seller" label="卖家" width="120" v-if="isAdmin || isFarmer">
        <template #default="{ row }">
          {{ row.seller || '未指定卖家' }}
        </template>
      </el-table-column>
      <el-table-column prop="order_time" label="订单时间" width="180" sortable>
        <template #default="{ row }">
          {{ formatDate(row.order_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="order_amount" label="订单金额" width="120" sortable>
        <template #default="{ row }">
          ¥{{ row.order_amount }}
        </template>
      </el-table-column>
      <el-table-column prop="order_status" label="订单状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.order_status)">
            {{ getStatusText(row.order_status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" v-if="isFarmer || isCustomer">
        <template #default="{ row }">
          <el-button size="small" @click="handleViewDetail(row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="isAdmin ? totalUsers : filteredUserOrders.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑订单对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增订单' : '编辑订单'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户ID" prop="user_id" v-if="isAdmin">
          <el-select v-model="form.user_id" placeholder="请选择用户" filterable>
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="`${user.userName} (ID: ${user.id})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品信息" prop="goods">
          <el-input v-model="form.goods" placeholder="请输入商品信息" />
        </el-form-item>
        <el-form-item label="买家" prop="buyer">
          <el-input v-model="form.buyer" placeholder="请输入买家信息" />
        </el-form-item>
        <el-form-item label="卖家" prop="seller">
          <el-input v-model="form.seller" placeholder="请输入卖家信息" />
        </el-form-item>
        <el-form-item label="订单时间" prop="order_time">
          <el-date-picker
            v-model="form.order_time"
            type="datetime"
            placeholder="选择订单时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="订单金额" prop="order_amount">
          <el-input-number v-model="form.order_amount" :precision="2" :step="0.1" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="订单状态" prop="order_status">
          <el-select v-model="form.order_status" placeholder="请选择订单状态">
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

    <!-- 订单详情对话框 -->
    <el-dialog
      title="订单详情"
      v-model="detailDialogVisible"
      width="500px"
    >
      <div v-if="selectedOrder" class="order-detail-dialog">
        <p><strong>订单ID:</strong> {{ selectedOrder.order_id }}</p>
        <p><strong>商品信息:</strong> {{ selectedOrder.goods || '未指定商品' }}</p>
        <p v-if="isAdmin || isCustomer"><strong>买家:</strong> {{ selectedOrder.buyer || '未指定买家' }}</p>
        <p v-if="isAdmin || isFarmer"><strong>卖家:</strong> {{ selectedOrder.seller || '未指定卖家' }}</p>
        <p><strong>订单时间:</strong> {{ formatDate(selectedOrder.order_time) }}</p>
        <p><strong>订单金额:</strong> ¥{{ selectedOrder.order_amount }}</p>
        <p><strong>订单状态:</strong> {{ getStatusText(selectedOrder.order_status) }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

// API URL
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 响应式数据
const orders = ref([]);
const users = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalUsers = ref(0);
const dialogVisible = ref(false);
const dialogType = ref('add');
const formRef = ref(null);
const currentUser = ref(null);
const detailDialogVisible = ref(false);
const selectedOrder = ref(null);

// 表单数据
const form = ref({
  order_id: null,
  user_id: null,
  goods: '',
  buyer: '',
  seller: '',
  order_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
  order_amount: 0,
  order_status: 0
});

// 表单验证规则
const rules = ref({
  user_id: [{ required: true, message: '请选择用户', trigger: 'change' }],
  goods: [{ required: true, message: '请输入商品信息', trigger: 'blur' }],
  buyer: [{ required: true, message: '请输入买家信息', trigger: 'blur' }],
  seller: [{ required: true, message: '请输入卖家信息', trigger: 'blur' }],
  order_time: [{ required: true, message: '请选择订单时间', trigger: 'change' }],
  order_amount: [{ required: true, message: '请输入订单金额', trigger: 'blur' }],
  order_status: [{ required: true, message: '请选择订单状态', trigger: 'change' }]
});

// 获取当前登录用户信息
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
  }
};

// 判断用户角色
const isAdmin = computed(() => {
  return currentUser.value && currentUser.value.authority === 0;
  console.log('aaa'+currentUser.value.authority);
});

const isCustomer = computed(() => {
  return currentUser.value && currentUser.value.authority === 1;
  console.log('aaa'+currentUser.value.authority);
});

const isFarmer = computed(() => {
  return currentUser.value && currentUser.value.authority === 2;
  console.log('aaa'+currentUser.value.authority);
});

// 获取当前用户的订单
const userOrders = computed(() => {
  if (!currentUser.value) return [];
  
  if (isCustomer.value || isFarmer.value) {
    // 客户和农户都通过user_id查看自己的订单
    return orders.value.filter(order => order.user_id === currentUser.value.id);
  }
  
  return [];
});

// 过滤用户订单
const filteredUserOrders = computed(() => {
  if (!searchKeyword.value) {
    return userOrders.value;
  }
  
  const keyword = searchKeyword.value.toLowerCase();
  return userOrders.value.filter(order => 
    (order.order_id && order.order_id.toString().includes(keyword)) ||
    (order.goods && order.goods.toLowerCase().includes(keyword)) ||
    (order.buyer && order.buyer.toLowerCase().includes(keyword)) ||
    (order.seller && order.seller.toLowerCase().includes(keyword)) ||
    (order.order_time && order.order_time.includes(keyword)) ||
    (order.order_amount && order.order_amount.toString().includes(keyword))
  );
});

// 过滤用户列表
const filteredUsers = computed(() => {
  if (!searchKeyword.value) {
    return users.value;
  }
  
  const keyword = searchKeyword.value.toLowerCase();
  return users.value.filter(user => {
    // 检查用户信息是否匹配关键字
    const userMatch = 
      user.id.toString().includes(keyword) ||
      (user.userName && user.userName.toLowerCase().includes(keyword)) ||
      (user.nickName && user.nickName.toLowerCase().includes(keyword)) ||
      (user.tel && user.tel.includes(keyword)) ||
      (user.local && user.local.toLowerCase().includes(keyword));
    
    // 检查该用户的订单是否匹配关键字
    const userOrders = getUserOrders(user.id);
    const orderMatch = userOrders.some(order => 
      order.order_id.toString().includes(keyword) ||
      (order.goods && order.goods.toLowerCase().includes(keyword)) ||
      (order.buyer && order.buyer.toLowerCase().includes(keyword)) ||
      (order.seller && order.seller.toLowerCase().includes(keyword)) ||
      order.order_time.includes(keyword) ||
      order.order_amount.toString().includes(keyword)
    );
    
    return userMatch || orderMatch;
  });
});

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${apiUrl}/tables/orders`);
    if (response.data.data) {
      orders.value = response.data.data;
    }
  } catch (error) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await axios.get(`${apiUrl}/tables/user`);
    if (response.data.data) {
      users.value = response.data.data;
      totalUsers.value = response.data.data.length;
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  }
};

// 获取用户的所有订单
const getUserOrders = (userId) => {
  return orders.value.filter(order => order.user_id === userId);
};

// 获取用户的订单数量
const getUserOrdersCount = (userId) => {
  return getUserOrders(userId).length;
};

// 获取用户的订单总金额
const getUserOrdersTotal = (userId) => {
  const userOrders = getUserOrders(userId);
  return userOrders.reduce((total, order) => total + parseFloat(order.order_amount), 0).toFixed(2);
};

// 获取客户信息
const getCustomerInfo = (userId) => {
  const user = users.value.find(u => u.id === userId);
  return user ? `${user.userName || ''}${user.nickName ? `(${user.nickName})` : ''}` : '未知客户';
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '未支付',
    1: '已支付',
    2: '已发货',
    3: '已完成',
    4: '已取消'
  };
  return statusMap[status] || '未知状态';
};

// 获取订单状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'primary',
    2: 'info',
    3: 'success',
    4: 'danger'
  };
  return typeMap[status] || '';
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
};

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 处理每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

// 显示编辑对话框
const handleEdit = (row) => {
  dialogType.value = 'edit';
  form.value = { ...row };
  dialogVisible.value = true;
};

// 显示新增对话框
const handleAdd = () => {
  dialogType.value = 'add';
  form.value = {
    order_id: null,
    user_id: null,
    goods: '',
    buyer: '',
    seller: '',
    order_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    order_amount: 0,
    order_status: 0
  };
  dialogVisible.value = true;
};

// 为特定用户添加订单
const handleAddOrderForUser = (user) => {
  dialogType.value = 'add';
  form.value = {
    order_id: null,
    user_id: user.id,
    goods: '',
    buyer: '',
    seller: '',
    order_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    order_amount: 0,
    order_status: 0
  };
  dialogVisible.value = true;
};

// 查看订单详情
const handleViewDetail = (row) => {
  selectedOrder.value = row;
  detailDialogVisible.value = true;
};

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这个订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`${apiUrl}/tables/orders/${row.order_id}`);
      ElMessage.success('删除成功');
      fetchOrders();
    } catch (error) {
      console.error('删除订单失败:', error);
      ElMessage.error('删除订单失败');
    }
  }).catch(() => {});
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 根据用户角色设置表单数据
        if (!isAdmin.value) {
          if (isCustomer.value) {
            form.value.user_id = currentUser.value.id;
          } else if (isFarmer.value) {
            form.value.farmer_id = currentUser.value.id;
          }
        }
        
        if (dialogType.value === 'add') {
          await axios.post(`${apiUrl}/tables/orders`, form.value);
          ElMessage.success('添加成功');
        } else {
          await axios.put(`${apiUrl}/tables/orders/${form.value.order_id}`, form.value);
          ElMessage.success('更新成功');
        }
        dialogVisible.value = false;
        fetchOrders();
      } catch (error) {
        console.error('保存订单失败:', error);
        ElMessage.error('保存订单失败');
      }
    }
  });
};

onMounted(() => {
  getCurrentUser();
  fetchOrders();
  fetchUsers();
  console.log('aaa'+currentUser.value.authority);
  // 调试代码
  setTimeout(() => {
    console.log('当前用户:', currentUser.value);
    console.log('所有订单:', orders.value);
    console.log('过滤后的用户订单:', userOrders.value);
  }, 2000);
});
</script>

<style scoped lang="scss">
.orders-manage {
  padding: 20px;
  width: 110%;
  margin-left: 100px;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 24px;
    }
    
    .actions {
      display: flex;
      gap: 10px;
      
      .search-input {
        width: 300px;
      }
    }
  }
  
  .user-table, .order-table {
    margin-bottom: 20px;
  }
  
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
  
  .orders-list {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 4px;
    
    h4 {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 16px;
      color: #409EFF;
    }
    
    .inner-table {
      margin-top: 10px;
    }
  }
  
  .order-detail {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 4px;
    
    h4 {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 16px;
    }
    
    p {
      margin: 8px 0;
    }
  }
  
  .order-detail-dialog {
    p {
      margin: 12px 0;
      line-height: 1.5;
    }
  }
}
</style>
<template>
  <div class="tasks-manage">
    <div class="header">
      <h2>任务管理</h2>
      <el-button v-if="isAdmin" type="primary" @click="showAddDialog = true">新增任务</el-button>
    </div>
    <div class="table-center">
      <el-table
        :data="tasks"
        border
        v-loading="loading"
        :style="{ minWidth: 'auto', width: 'auto' }"
        class="no-horizontal-scroll"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="任务名称" label="任务名称" width="150"/>
        <el-table-column prop="起始时间" label="开始时间" width="150"/>
        <el-table-column prop="结束时间" label="结束时间" width="150"/>
        <el-table-column prop="任务地点" label="任务地点" width="180"/>
        <el-table-column prop="任务状态" label="任务状态" width="90">
          <template #default="{ row }">
            {{ statusMap[row['任务状态']] }}
          </template>
        </el-table-column>
        <el-table-column prop="任务报酬" label="任务报酬" width="180"/>
        <el-table-column prop="已报名人数" label="已报名人数" width="100"/>
        <el-table-column prop="任务详情" label="任务详情" width="180"/>
        <el-table-column label="操作" width="180">
          <template #default="{ row, $index }">
            <!-- 管理员：编辑 + 删除 -->
            <template v-if="isAdmin">
              <el-button size="small" @click="onEdit(row, $index)">编辑</el-button>
              <el-button size="small" type="danger" @click="onDelete(row, $index)">删除</el-button>
            </template>
            <!-- 客户：只有进行中的任务才显示按钮 -->
            <template v-if="isClient && row['任务状态'] === 3">
              <el-button
                v-if="!acceptedIds.has(row.id)"
                size="small"
                type="success"
                @click="onAccept(row)"
              >接取任务</el-button>
              <el-button
                v-else
                size="small"
                type="warning"
                @click="onCancel(row)"
              >取消接取</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增任务弹窗 -->
    <el-dialog v-model="showAddDialog" title="新增任务" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="任务名称" prop="任务名称">
          <el-input v-model="form['任务名称']" />
        </el-form-item>
        <el-form-item label="起始时间" prop="起始时间">
          <el-date-picker
            v-model="form['起始时间']"
            type="datetime"
            placeholder="选择起始时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="结束时间">
          <el-date-picker
            v-model="form['结束时间']"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="任务地点" prop="任务地点">
          <el-input v-model="form['任务地点']" />
        </el-form-item>
        <el-form-item label="任务状态" prop="任务状态">
          <el-select v-model="form['任务状态']">
            <el-option v-for="(label, value) in statusMap" :key="value" :label="label" :value="Number(value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务报酬" prop="任务报酬">
          <el-input v-model="form['任务报酬']" />
        </el-form-item>
        <el-form-item label="任务详情" prop="任务详情">
          <el-input v-model="form['任务详情']" type="textarea" />
        </el-form-item>
        <el-form-item label="需要人数" prop="已报名人数">
          <el-input-number v-model="form['已报名人数']" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addTask">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑任务弹窗 -->
    <el-dialog v-model="showEditDialog" title="编辑任务" width="500px">
      <el-form :model="form" :rules="rules" ref="formEditRef" label-width="90px">
        <el-form-item label="任务名称" prop="任务名称">
          <el-input v-model="form['任务名称']" />
        </el-form-item>
        <el-form-item label="起始时间" prop="起始时间">
          <el-date-picker
            v-model="form['起始时间']"
            type="datetime"
            placeholder="选择起始时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="结束时间">
          <el-date-picker
            v-model="form['结束时间']"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="任务地点" prop="任务地点">
          <el-input v-model="form['任务地点']" />
        </el-form-item>
        <el-form-item label="任务状态" prop="任务状态">
          <el-select v-model="form['任务状态']">
            <el-option v-for="(label, value) in statusMap" :key="value" :label="label" :value="Number(value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务报酬" prop="任务报酬">
          <el-input v-model="form['任务报酬']" />
        </el-form-item>
        <el-form-item label="任务详情" prop="任务详情">
          <el-input v-model="form['任务详情']" type="textarea" />
        </el-form-item>
        <el-form-item label="需要人数" prop="已报名人数">
          <el-input-number v-model="form['已报名人数']" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="editTask">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const apiUrl = import.meta.env.VITE_API_URL

// 获取当前用户权限
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = user.authority === 0
const isClient = user.authority === 2

const tasks = ref([])
const loading = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const editIndex = ref(-1)
const formRef = ref()
const formEditRef = ref()
const form = ref({
  "任务名称": "",
  "起始时间": "",
  "结束时间": "",
  "任务地点": "",
  "任务状态": 0,
  "任务报酬": "",
  "任务详情": "",
  "已报名人数": 1
})
const statusMap = {
  0: '待审核',
  1: '已发布',
  2: '已下架',
  3: '进行中',
  4: '已结束'
}

// 已接取的任务 id 集合
const acceptedIds = ref(new Set())

// 校验规则
const rules = {
  "任务名称": [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  "起始时间": [{ required: true, message: '请选择起始时间', trigger: 'change' }],
  "结束时间": [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value || !form.value['起始时间']) {
          callback()
        } else if (value < form.value['起始时间']) {
          callback(new Error('结束时间不能早于开始时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  "任务地点": [{ required: true, message: '请输入任务地点', trigger: 'blur' }],
  "任务状态": [{ required: true, message: '请选择任务状态', trigger: 'change' }],
  "任务报酬": [{ required: true, message: '请输入任务报酬', trigger: 'blur' }],
  "任务详情": [{ required: true, message: '请输入任务详情', trigger: 'blur' }],
  "已报名人数": [{ required: true, type: 'number', message: '请输入需要人数', trigger: 'blur' }]
}

// 获取任务列表
const fetchTasks = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${apiUrl}/tables/tasks`)
    tasks.value = response.data.data
  } catch (e) {
    ElMessage.error('获取任务失败')
  } finally {
    loading.value = false
  }
}

// 新增任务
const addTask = async () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      await axios.post(`${apiUrl}/tables/tasks`, form.value)
      ElMessage.success('新增成功')
      showAddDialog.value = false
      await fetchTasks()
      resetForm()
    } catch (e) {
      ElMessage.error('新增失败')
    }
  })
}

// 编辑任务
const onEdit = (row, index) => {
  Object.assign(form.value, row)
  editIndex.value = index
  showEditDialog.value = true
}
const editTask = async () => {
  formEditRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const id = tasks.value[editIndex.value].id
      await axios.put(`${apiUrl}/tables/tasks/${id}`, form.value)
      ElMessage.success('修改成功')
      showEditDialog.value = false
      await fetchTasks()
      resetForm()
    } catch (e) {
      ElMessage.error('修改失败')
    }
  })
}

// 删除任务
const onDelete = (row, index) => {
  ElMessageBox.confirm('确定要删除该任务吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const id = row.id
      await axios.delete(`${apiUrl}/tables/tasks/${id}`)
      ElMessage.success('删除成功')
      await fetchTasks()
    } catch (e) {
      ElMessage.error('删除失败')
    }
  })
}

// 接取任务
const onAccept = (row) => {
  ElMessageBox.confirm(`确定要接取任务「${row['任务名称']}」吗？`, '提示', {
    type: 'info',
    confirmButtonText: '确定接取',
    cancelButtonText: '取消'
  }).then(() => {
    acceptedIds.value = new Set([...acceptedIds.value, row.id])
    ElMessage.success('接取成功！')
  })
}

// 取消接取
const onCancel = (row) => {
  ElMessageBox.confirm(`确定要取消接取任务「${row['任务名称']}」吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定取消',
    cancelButtonText: '返回'
  }).then(() => {
    const newSet = new Set(acceptedIds.value)
    newSet.delete(row.id)
    acceptedIds.value = newSet
    ElMessage.success('已取消接取')
  })
}

// 重置表单
const resetForm = () => {
  form.value = {
    "任务名称": "",
    "起始时间": "",
    "结束时间": "",
    "任务地点": "",
    "任务状态": 0,
    "任务报酬": "",
    "任务详情": "",
    "已报名人数": 0
  }
}

onMounted(fetchTasks)
</script>

<style scoped lang="scss">
.tasks-manage {
  padding: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    width: 100%;
  }
  .table-center {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .no-horizontal-scroll {
    max-width: 1200px;
    min-width: 900px;
    width: auto;
    overflow-x: hidden !important;
  }
}
.no-horizontal-scroll ::-webkit-scrollbar {
  height: 0 !important;
  width: 8px;
}
</style>
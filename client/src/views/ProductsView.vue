<template>
  <div class="products-manage">
    <div class="header">
      <h2>产品管理</h2>
      <el-button type="primary" @click="showAddDialog">新增产品</el-button>
    </div>

    <!-- 产品列表表格 -->
    <el-table :data="products" border  v-loading="loading">
      <el-table-column type="index" label="序号" width="80" />
      <el-table-column prop="name" label="产品名称" width="150"/>
      <el-table-column prop="price" label="价格" width="80">
        <template #default="{ row }">
          ¥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="originalPrice" label="原价" width="80">
        <template #default="{ row }">
          ¥{{ row.originalPrice }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="规格" width="100" />
      <el-table-column prop="categoryId" label="分类" width="120">
        <template #default="{ row }">
          {{ getCategoryName(row.categoryId) }}
        </template>
      </el-table-column>
      <el-table-column prop="sales" label="销量" width="120" />
      <el-table-column prop="image" label="图片" width="120">
        <template #default="{ row }">
          <el-image 
            style="width: 60px; height: 60px" 
            :src="row.image" 
            :preview-src-list="[row.image]"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="tags" label="标签" width="120">
        <template #default="{ row }">
          <div class="tag-container">
            <span v-for="(tag, index) in row.tags" :key="index" 
                  :class="['product-tag', `tag-${tag}`]">
              {{ tag }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column  label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增产品' : '编辑产品'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="form.originalPrice" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="规格" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入产品规格，如：25g、8斤、3个" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option label="水果" :value="1" />
            <el-option label="蔬菜" :value="2" />
            <el-option label="粮油" :value="3" />
            <el-option label="禽蛋" :value="4" />
            <el-option label="水产" :value="5" />
            <el-option label="坚果" :value="6" />
            <el-option label="蜂蜜" :value="7" />
            <el-option label="茶叶" :value="8" />
            <el-option label="特产" :value="9" />
            <el-option label="干货" :value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品图片" prop="image">
          <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImageChange"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">点击上传图片</div>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select v-model="form.tags" multiple placeholder="请选择标签">
            <el-option label="热销" value="热销" />
            <el-option label="新品" value="新品" />
            <el-option label="推荐" value="推荐" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// API URL
const apiUrl = import.meta.env.VITE_API_URL

// State variables
const loading = ref(false)
const products = ref([])
const categories = ref([])
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const imageUrl = ref('')
const imageFile = ref(null)

// 分类数据
const categoryMap = {
  1: '水果',
  2: '蔬菜',
  3: '粮油',
  4: '禽蛋',
  5: '水产',
  6: '坚果',
  7: '蜂蜜',
  8: '茶叶',
  9: '特产',
  10: '干货'
}

// Form data
const form = ref({
  name: '',
  price: 0,
  originalPrice: 0,
  categoryId: '',
  image: '',
  tags: [],
  sales: 0,
  amount: ''
})

// Form validation rules
const rules = {
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'change' }],
  originalPrice: [{ required: true, message: '请输入原价', trigger: 'change' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  image: [{ required: true, message: '请上传产品图片', trigger: 'change' }]
}

// 处理图片变化
const handleImageChange = (file) => {
  imageFile.value = file.raw
  imageUrl.value = URL.createObjectURL(file.raw)
  form.value.image = imageUrl.value // 临时设置图片URL
}

// 将图片转换为Base64
const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

// Fetch products list
const fetchProducts = async () => {
  try {
    loading.value = true
    const response = await axios.get(`${apiUrl}/tables/products`)
    products.value = response.data.data
  } catch (error) {
    ElMessage.error('获取产品列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Get category name by ID
const getCategoryName = (categoryId) => {
  return categoryMap[categoryId] || '未知分类'
}

// Show add dialog
const showAddDialog = () => {
  dialogType.value = 'add'
  form.value = {
    name: '',
    price: 0,
    originalPrice: 0,
    categoryId: '',
    image: '',
    tags: [],
    sales: 0,
    amount: ''
  }
  imageUrl.value = ''
  imageFile.value = null
  dialogVisible.value = true
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Show edit dialog
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  imageUrl.value = row.image
  dialogVisible.value = true
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Handle delete
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该产品吗？', '提示', {
      type: 'warning'
    })
    await axios.delete(`${apiUrl}/tables/products/${row.id}`)
    ElMessage.success('删除成功')
    await fetchProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 处理图片
    if (imageFile.value) {
      // 如果有新上传的图片，转换为Base64
      const base64Image = await convertImageToBase64(imageFile.value)
      form.value.image = base64Image
      console.log('图片编码值：')
      console.log(form.value.image)
    } else if (dialogType.value === 'edit' && !imageFile.value && imageUrl.value) {
      // 编辑模式下，如果没有新上传图片但有原图片URL，保持原图片
      console.log('使用原图片')
    } else if (!form.value.image) {
      // 如果没有图片，提示错误
      ElMessage.error('请上传产品图片')
      return
    }
    
    if (dialogType.value === 'add') {
      await axios.post(`${apiUrl}/tables/products`, form.value)
      ElMessage.success('添加成功')
    } else {
      await axios.put(`${apiUrl}/tables/products/${form.value.id}`, form.value)
      ElMessage.success('更新成功')
    }
    
    dialogVisible.value = false
    await fetchProducts()
  } catch (error) {
    if (error.message) {
      ElMessage.error('表单验证失败')
    } else {
      ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
      console.error(error)
    }
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped lang="scss">
.products-manage {
  
  width: 111%;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .avatar-uploader {
    width: 178px;
    height: 178px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
    
    &:hover {
      border-color: #409EFF;
    }
    
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }
  }
  
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  
  .upload-tip {
    font-size: 12px;
    color: #606266;
    margin-top: 7px;
  }
}
</style>

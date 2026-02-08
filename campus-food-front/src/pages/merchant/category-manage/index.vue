<template>
  <view class="category-manage">
    <!-- 分类列表 -->
    <view class="category-list">
      <view
        class="category-item"
        v-for="category in categories"
        :key="category.id"
      >
        <text class="category-name">{{ category.name }}</text>
        <view class="category-actions">
          <button class="edit-btn" size="mini" @click="handleEdit(category)">
            编辑
          </button>
          <button
            class="delete-btn"
            size="mini"
            @click="handleDelete(category.id)"
          >
            删除
          </button>
        </view>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view class="add-section">
      <button class="add-btn" @click="showAddDialog = true">+ 新增分类</button>
    </view>

    <!-- 添加/编辑弹窗 -->
    <view
      class="modal-mask"
      v-if="showAddDialog"
      @click="showAddDialog = false"
    >
      <view class="modal-content" @click.stop>
        <text class="modal-title">{{
          editingCategory?.id ? "编辑分类" : "新增分类"
        }}</text>
        <view class="form-item">
          <text class="label">分类名称</text>
          <input
            class="input"
            v-model="categoryForm.name"
            placeholder="请输入分类名称"
          />
        </view>
        <view class="form-item">
          <text class="label">排序序号</text>
          <input
            class="input"
            v-model.number="categoryForm.index"
            type="number"
            placeholder="数字越小越靠前"
          />
        </view>
        <view class="modal-actions">
          <button class="cancel-btn" @click="showAddDialog = false">
            取消
          </button>
          <button class="confirm-btn" @click="handleConfirm">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getFoodCategories } from "@/api/food";
import {
  createCategory,
  updateCategory,
  removeCategory,
} from "@/api/categories";
import type { FoodCategory } from "@/types/food";

const categories = ref<FoodCategory[]>([]);
const showAddDialog = ref(false);
const editingCategory = ref<FoodCategory | null>(null);
const categoryForm = ref({ name: "", index: 0 });

const loadCategories = async () => {
  try {
    const data = await getFoodCategories();
    categories.value = data;
  } catch (error) {
    console.error("获取分类失败:", error);
  }
};

const handleEdit = (category: FoodCategory) => {
  editingCategory.value = category;
  categoryForm.value = { name: category.name, index: category.index ?? 0 };
  showAddDialog.value = true;
};

const handleDelete = async (categoryId?: string) => {
  if (!categoryId) return;
  uni.showModal({
    title: "提示",
    content: "确定删除该分类吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await removeCategory(categoryId);
          uni.showToast({ title: "删除成功", icon: "success" });
          loadCategories();
        } catch (error: any) {
          uni.showToast({ title: error.message || "删除失败", icon: "none" });
        }
      }
    },
  });
};

const handleConfirm = async () => {
  if (!categoryForm.value.name) {
    return uni.showToast({ title: "请输入分类名称", icon: "none" });
  }
  try {
    if (editingCategory.value?.id) {
      await updateCategory(editingCategory.value.id, categoryForm.value);
    } else {
      await createCategory(categoryForm.value);
    }
    uni.showToast({ title: "保存成功", icon: "success" });
    showAddDialog.value = false;
    editingCategory.value = null;
    categoryForm.value = { name: "", index: 0 };
    loadCategories();
  } catch (error: any) {
    uni.showToast({ title: error.message || "保存失败", icon: "none" });
  }
};

onMounted(() => {
  loadCategories();
});
</script>

<style scoped lang="scss">
.category-manage {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.category-list {
  padding: 20rpx 30rpx;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.category-name {
  font-size: 30rpx;
  color: #333333;
}

.category-actions {
  display: flex;
  gap: 20rpx;
}

.edit-btn,
.delete-btn {
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  border: none;
}

.edit-btn {
  background: #667eea;
  color: #ffffff;
}

.delete-btn {
  background: #ff6b6b;
  color: #ffffff;
}

.add-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: #ffffff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.add-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  width: 600rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 40rpx;
  display: block;
  text-align: center;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 20rpx;
}

.input {
  width: 100%;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  border: none;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666666;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}
</style>

<template>
  <view class="pay-container">
    <!-- 订单信息 -->
    <view class="order-section">
      <view class="section-title">订单信息</view>
      <view class="order-item">
        <image
          class="item-image"
          :src="orderInfo.foodImage"
          mode="aspectFill"
        />
        <view class="item-info">
          <text class="item-name">{{ orderInfo.foodName }}</text>
          <text class="item-price"
            >¥{{ (orderInfo.price / 100).toFixed(2) }}</text
          >
        </view>
        <text class="item-quantity">x{{ orderInfo.quantity }}</text>
      </view>
    </view>

    <!-- 配送方式（拼单订单在参与时已选，此处不展示） -->
    <view class="delivery-section" v-if="orderType === 'alone'">
      <view class="section-title">配送方式</view>
      <view class="delivery-options">
        <view
          class="delivery-option"
          :class="{ active: selectedDeliveryType === item.value }"
          v-for="item in deliveryOptions"
          :key="item.value"
          @click="selectedDeliveryType = item.value"
        >
          <text class="option-icon">{{ item.icon }}</text>
          <text class="option-name">{{ item.label }}</text>
          <text class="option-check" v-if="selectedDeliveryType === item.value"
            >✓</text
          >
        </view>
      </view>
    </view>

    <!-- 配送地址（拼单不在此选） -->
    <view
      class="address-section"
      v-if="
        orderType === 'alone' &&
        (selectedDeliveryType === 'alone' ||
          selectedDeliveryType === 'together')
      "
    >
      <view class="section-title">配送地址</view>
      <picker
        mode="selector"
        :range="campusList"
        range-key="name"
        :value="addressPickerIndex"
        @change="onAddressPickerChange"
        class="address-picker"
      >
        <view class="address-item">
          <text class="address-text" v-if="selectedAddress">{{
            selectedAddress
          }}</text>
          <text class="address-placeholder" v-else>请选择配送地址</text>
          <text class="address-arrow">></text>
        </view>
      </picker>
    </view>

    <!-- 备注 -->
    <view class="remark-section">
      <view class="section-title">备注</view>
      <textarea
        class="remark-input"
        v-model="remark"
        placeholder="选填，可以填写特殊要求"
        maxlength="100"
      />
    </view>

    <!-- 价格明细 -->
    <view class="price-section">
      <view class="price-row">
        <text class="price-label">商品金额</text>
        <text class="price-value"
          >¥{{
            ((orderInfo.price * orderInfo.quantity) / 100).toFixed(2)
          }}</text
        >
      </view>
      <view class="price-row">
        <text class="price-label">配送费</text>
        <text class="price-value">¥{{ (deliveryPrice / 100).toFixed(2) }}</text>
      </view>
      <view class="price-row total">
        <text class="price-label">合计</text>
        <text class="price-value">¥{{ (totalPrice / 100).toFixed(2) }}</text>
      </view>
    </view>

    <!-- 底部支付栏 -->
    <view class="bottom-bar">
      <view class="price-info">
        <text class="price-label">合计：</text>
        <text class="price-value">¥{{ (totalPrice / 100).toFixed(2) }}</text>
      </view>
      <button class="pay-btn" @click="handlePay">立即支付</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { createOrder, getOrderDetail, payOrder } from "@/api/order";
import { getFoodDetail } from "@/api/food";
import { getGroupDetail, createGroup } from "@/api/group";
import { getCampusAddressList } from "@/api/campusAddresses";
import { DeliveryType } from "@/types/group";
import { DELIVERY_TYPE_TEXT, STORAGE_KEYS } from "@/utils/constants";
import { useOrderStore } from "@/stores/order";
import { useUserStore } from "@/stores/user";

const orderStore = useOrderStore();
const userStore = useUserStore();

const orderType = ref<"alone" | "group" | "createGroup">("alone");
const foodId = ref("");
const groupId = ref("");
const orderId = ref("");
const orderTotal = ref(0); // 拼单订单实付（分）
const orderInfo = ref({
  foodId: "",
  foodName: "",
  foodImage: "",
  price: 0,
  quantity: 1,
});
const selectedDeliveryType = ref<DeliveryType>("alone");
const selectedAddressId = ref("");
const selectedAddress = ref("");
const selectedContactName = ref("");
const selectedContactPhone = ref("");
const remark = ref("");

const deliveryOptions = [
  {
    value: "alone" as DeliveryType,
    label: DELIVERY_TYPE_TEXT.alone,
    icon: "🚚",
  },
  {
    value: "together" as DeliveryType,
    label: DELIVERY_TYPE_TEXT.together,
    icon: "📦",
  },
  {
    value: "pickup" as DeliveryType,
    label: DELIVERY_TYPE_TEXT.pickup,
    icon: "🏪",
  },
];

const deliveryPrice = computed(() => {
  if (selectedDeliveryType.value === "pickup") return 0;
  return 500; // 5元配送费
});

const totalPrice = computed(() => {
  if (orderType.value === "group" || orderType.value === "createGroup")
    return orderTotal.value;
  return orderInfo.value.price * orderInfo.value.quantity + deliveryPrice.value;
});

// 校园配送点列表（页面加载时拉取，供 picker 使用）
const campusList = ref<Array<{ id: string; name: string }>>([]);
const addressPickerIndex = computed(() => {
  if (!selectedAddressId.value || !campusList.value.length) return 0;
  const i = campusList.value.findIndex((a) => a.id === selectedAddressId.value);
  return i >= 0 ? i : 0;
});

const loadCampusList = async () => {
  try {
    const list = await getCampusAddressList();
    campusList.value = (list || []).map(
      (a: { _id?: string; id?: string; name: string }) => ({
        id: (a as { _id?: string })._id || (a as { id?: string }).id || "",
        name: a.name,
      })
    );
  } catch (e) {
    campusList.value = [];
  }
};

onLoad(async (options) => {
  // 团长先付款再发布：从创建拼单页跳转，带 orderId 与 fromCreateGroup=1
  if (options.orderId && options.fromCreateGroup === "1") {
    orderId.value = options.orderId;
    orderType.value = "createGroup";
    await fetchOrderByOrderId(options.orderId);
    return;
  }
  if (options.groupId && options.type === "group") {
    groupId.value = options.groupId;
    orderType.value = "group";
    await fetchGroupOrder();
    return;
  }
  if (options.foodId) {
    foodId.value = options.foodId;
    orderType.value = options.type === "group" ? "group" : "alone";
    if (options.groupId) groupId.value = options.groupId;
    fetchFoodInfo();
    loadCampusList();
  }
});

// 发起拼单流程：按订单 id 加载订单信息
const fetchOrderByOrderId = async (oid: string) => {
  try {
    const order = await getOrderDetail(oid);
    const o = order as {
      items?: Array<{
        foodId?: string;
        foodName: string;
        foodImage?: string;
        price: number;
        quantity: number;
      }>;
      finalPrice?: number;
      totalPrice?: number;
    };
    const items = o.items;
    const first = items?.[0];
    orderInfo.value = {
      foodId: first?.foodId ?? "",
      foodName: first?.foodName ?? "",
      foodImage: first?.foodImage ?? "/static/logo.png",
      price: first?.price ?? 0,
      quantity: first?.quantity ?? 1,
    };
    orderTotal.value = o.finalPrice ?? o.totalPrice ?? first?.price ?? 0;
  } catch (error) {
    console.error("获取订单失败:", error);
    uni.showToast({ title: "加载失败", icon: "none" });
  }
};

// 拼单订单：从拼单详情获取当前用户的订单并加载
const fetchGroupOrder = async () => {
  try {
    const groupData = await getGroupDetail(groupId.value);
    const myId = userStore.userInfo?.id;
    if (!myId) {
      uni.showToast({ title: "请先登录", icon: "none" });
      return;
    }
    // 后端可能返回 userId/orderId 为 ObjectId 或对象，统一转字符串比较
    const getStrId = (v: unknown): string =>
      v == null
        ? ""
        : typeof v === "object" && v !== null && "_id" in v
        ? String((v as { _id: unknown })._id)
        : String(v);
    const participant = (groupData.participants || []).find(
      (p: { userId?: unknown }) => getStrId(p.userId) === String(myId)
    );
    const pid = participant
      ? getStrId((participant as { orderId?: unknown }).orderId)
      : "";
    if (!pid) {
      uni.showToast({ title: "未找到拼单订单", icon: "none" });
      return;
    }
    orderId.value = pid;
    const order = await getOrderDetail(pid);
    const o = order as {
      items?: Array<{
        foodId?: string;
        foodName: string;
        foodImage?: string;
        price: number;
        quantity: number;
      }>;
      finalPrice?: number;
      totalPrice?: number;
    };
    const items = o.items;
    const first = items?.[0];
    orderInfo.value = {
      foodId: first?.foodId ?? "",
      foodName: first?.foodName ?? "",
      foodImage: first?.foodImage ?? "/static/logo.png",
      price: first?.price ?? 0,
      quantity: first?.quantity ?? 1,
    };
    orderTotal.value = o.finalPrice ?? o.totalPrice ?? first?.price ?? 0;
  } catch (error) {
    console.error("获取拼单订单失败:", error);
    uni.showToast({ title: "加载失败", icon: "none" });
  }
};

// 获取美食信息（单独下单）
const fetchFoodInfo = async () => {
  try {
    const food = await getFoodDetail(foodId.value);
    const fid =
      (food as { id?: string; _id?: string }).id ??
      (food as { _id?: string })._id;
    orderInfo.value = {
      foodId: fid || "",
      foodName: food.name,
      foodImage: food.images?.[0] || "/static/logo.png",
      price: food.price,
      quantity: 1,
    };
  } catch (error) {
    console.error("获取美食信息失败:", error);
  }
};

// picker 选择配送地址
const onAddressPickerChange = (e: { detail: { value: string } }) => {
  const idx = Number(e.detail.value);
  if (campusList.value[idx]) {
    const a = campusList.value[idx];
    selectedAddressId.value = a.id;
    selectedAddress.value = a.name;
  }
};

// 支付
const handlePay = async () => {
  // 团长先付款再发布：支付成功后带 creatorOrderId 创建拼单，再跳转详情
  if (orderType.value === "createGroup") {
    if (!orderId.value) {
      uni.showToast({ title: "订单信息异常", icon: "none" });
      return;
    }
    try {
      await payOrder(orderId.value);
      const pending = uni.getStorageSync(STORAGE_KEYS.PENDING_CREATE_GROUP) as
        | {
            orderId: string;
            foodId: string;
            targetNum: number;
            duration: number;
            deliveryType: string;
            campusAddressId?: string;
            endTime: string;
          }
        | undefined;
      uni.removeStorageSync(STORAGE_KEYS.PENDING_CREATE_GROUP);
      if (pending && pending.foodId && pending.endTime) {
        const data = await createGroup({
          foodId: pending.foodId,
          targetNum: pending.targetNum,
          deliveryType: pending.deliveryType as "alone" | "together" | "pickup",
          endTime: pending.endTime,
          campusAddressId: pending.campusAddressId,
          creatorOrderId: orderId.value,
        });
        const newId =
          (data as { id?: string }).id || (data as { _id?: string })._id;
        uni.showToast({ title: "支付成功", icon: "success" });
        setTimeout(() => {
          uni.redirectTo({
            url: newId
              ? `/pages/student/group/detail?id=${newId}`
              : "/pages/student/group/index",
          });
        }, 1500);
      } else {
        uni.showToast({ title: "支付成功", icon: "success" });
        setTimeout(() => {
          uni.redirectTo({ url: "/pages/student/group/index" });
        }, 1500);
      }
    } catch (error) {
      console.error("支付失败:", error);
      uni.showToast({ title: "支付失败，请重试", icon: "none" });
    }
    return;
  }

  if (orderType.value === "group") {
    if (!orderId.value) {
      uni.showToast({ title: "订单信息异常", icon: "none" });
      return;
    }
    try {
      await payOrder(orderId.value);
      uni.showToast({ title: "支付成功", icon: "success" });
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/student/group/detail?id=${groupId.value}`,
        });
      }, 1500);
    } catch (error) {
      console.error("支付失败:", error);
      uni.showToast({ title: "支付失败，请重试", icon: "none" });
    }
    return;
  }

  if (
    (selectedDeliveryType.value === "alone" ||
      selectedDeliveryType.value === "together") &&
    !selectedAddressId.value
  ) {
    uni.showToast({
      title: "请选择配送地址",
      icon: "none",
    });
    return;
  }

  try {
    const order = await createOrder({
      items: [
        {
          foodId: orderInfo.value.foodId,
          quantity: orderInfo.value.quantity,
        },
      ],
      deliveryType: selectedDeliveryType.value,
      campusAddressId: selectedAddressId.value || undefined,
      contactName: selectedContactName.value || undefined,
      contactPhone: selectedContactPhone.value || undefined,
      remark: remark.value || undefined,
      groupId: groupId.value || undefined,
    });

    orderStore.setCurrentOrder(order);

    const oid = order.id || (order as { _id?: string })._id;
    if (!oid) {
      uni.showToast({ title: "订单信息异常", icon: "none" });
      return;
    }

    await payOrder(oid);

    uni.showToast({
      title: "支付成功",
      icon: "success",
    });
    setTimeout(() => {
      uni.redirectTo({
        url: `/pages/student/order/track?id=${oid}`,
      });
    }, 1500);
  } catch (error) {
    console.error("支付失败:", error);
    uni.showToast({
      title: "支付失败，请重试",
      icon: "none",
    });
  }
};
</script>

<style scoped lang="scss">
.pay-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.order-section,
.delivery-section,
.address-section,
.price-section {
  background: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
}
.remark-section {
  padding: 30rpx;
  padding-right: 60rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  background: #ffffff;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
  display: block;
}

.order-item {
  display: flex;
  align-items: center;
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 10rpx;
}

.item-price {
  font-size: 26rpx;
  color: #ff6b6b;
}

.item-quantity {
  font-size: 26rpx;
  color: #999999;
}

.delivery-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.delivery-option {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 16rpx;

  &.active {
    border-color: #667eea;
    background: #f0f4ff;
  }
}

.option-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.option-name {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.option-check {
  font-size: 32rpx;
  color: #667eea;
}

.address-picker {
  width: 100%;
}

.address-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
}

.address-text {
  font-size: 28rpx;
  color: #333333;
}

.address-placeholder {
  font-size: 28rpx;
  color: #999999;
}

.address-arrow {
  font-size: 28rpx;
  color: #999999;
}

.remark-input {
  width: 98%;
  padding-top: 20rpx;
  padding-bottom: 20rpx;
  padding-left: 20rpx;
  padding-right: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.total {
    padding-top: 15rpx;
    border-top: 1rpx solid #f0f0f0;
  }
}

.price-label {
  font-size: 28rpx;
  color: #666666;
}

.price-value {
  font-size: 28rpx;
  color: #333333;

  .total & {
    font-size: 32rpx;
    font-weight: bold;
    color: #ff6b6b;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 24rpx 30rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.bottom-bar .price-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.bottom-bar .price-label {
  font-size: 28rpx;
  color: #666666;
  flex-shrink: 0;
}

.bottom-bar .price-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.bottom-bar .pay-btn {
  flex-shrink: 0;
  min-width: 200rpx;
  height: 88rpx;
  padding: 0 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }
}
</style>

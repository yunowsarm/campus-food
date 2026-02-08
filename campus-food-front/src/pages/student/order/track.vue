<template>
  <view class="track-container">
    <!-- 加载中 -->
    <view class="loading-state" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 订单详情 -->
    <template v-else-if="order">
    <!-- 订单状态 -->
    <view class="status-section">
      <view class="status-icon" :class="`status-${order?.status}`">
        <text class="icon-text">{{ getStatusIcon(order?.status) }}</text>
      </view>
      <text class="status-text">{{ getStatusText(order?.status) }}</text>
      <text class="status-desc" v-if="order?.status === 'delivering'">
        预计{{ getDeliveryTime() }}送达
      </text>
    </view>

    <!-- 订单信息 -->
    <view class="order-info-section">
      <view class="info-row">
        <text class="info-label">订单号</text>
        <text class="info-value selectable">{{ order?.orderNo }}</text>
      </view>
      <view class="info-row" v-if="order?.merchantName">
        <text class="info-label">商家</text>
        <text class="info-value">{{ order.merchantName }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">下单时间</text>
        <text class="info-value">{{ formatTime(order?.createdAt) }}</text>
      </view>
      <view class="info-row" v-if="order?.paidAt">
        <text class="info-label">支付时间</text>
        <text class="info-value">{{ formatTime(order.paidAt) }}</text>
      </view>
      <view class="info-row" v-if="order?.remark">
        <text class="info-label">备注</text>
        <text class="info-value remark">{{ order.remark }}</text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="goods-section">
      <view class="section-title">商品信息</view>
      <view v-for="item in order?.items" :key="item.id" class="goods-item">
        <image
          class="goods-image"
          :src="item.foodImage || '/static/logo.png'"
          mode="aspectFill"
        />
        <view class="goods-info">
          <text class="goods-name">{{ item.foodName }}</text>
          <text class="goods-spec" v-if="item.spec">{{ item.spec }}</text>
          <view class="goods-footer">
            <text class="goods-price"
              >¥{{ (item.price / 100).toFixed(2) }}</text
            >
            <text class="goods-quantity">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 配送信息 -->
    <view class="delivery-section" v-if="order?.deliveryType !== 'pickup'">
      <view class="section-title">配送信息</view>
      <view class="delivery-info">
        <text class="delivery-type">{{
          getDeliveryTypeText(order?.deliveryType)
        }}</text>
        <text class="delivery-address" v-if="order?.address">{{
          order.address
        }}</text>
      </view>
      <view class="delivery-no-row" v-if="deliveryNo">
        <text class="info-label">配送单号</text>
        <text class="info-value">{{ deliveryNo }}</text>
      </view>
    </view>

    <!-- 收货人（所有订单都显示，后端未返回则显示当前用户） -->
    <view class="recipient-section" v-if="order">
      <view class="recipient-row">
        <text class="recipient-label">收货人</text>
        <text class="recipient-value">{{ recipientName }}</text>
      </view>
      <view class="recipient-row" v-if="recipientPhone">
        <text class="recipient-label">手机号</text>
        <text class="recipient-value">{{ recipientPhone }}</text>
      </view>
    </view>

    <!-- 价格明细 -->
    <view class="price-section">
      <view class="price-row">
        <text class="price-label">商品金额</text>
        <text class="price-value"
          >¥{{ ((order?.totalPrice || 0) / 100).toFixed(2) }}</text
        >
      </view>
      <view class="price-row" v-if="order?.deliveryPrice">
        <text class="price-label">配送费</text>
        <text class="price-value"
          >¥{{ (order.deliveryPrice / 100).toFixed(2) }}</text
        >
      </view>
      <view class="price-row total">
        <text class="price-label">实付金额</text>
        <text class="price-value"
          >¥{{ ((order?.finalPrice || 0) / 100).toFixed(2) }}</text
        >
      </view>
    </view>

    <!-- 退款状态 -->
    <view
      class="refund-section"
      v-if="order?.refundStatus && order.refundStatus !== 'none'"
    >
      <text class="refund-label">退款状态</text>
      <text class="refund-value" :class="order.refundStatus">
        {{
          order.refundStatus === "pending"
            ? "审核中"
            : order.refundStatus === "approved"
            ? "已退款"
            : "已拒绝"
        }}
      </text>
      <text class="refund-reason" v-if="order.refundReason">{{
        order.refundReason
      }}</text>
    </view>

    <!-- 操作按钮 -->
    <view class="actions-section" v-if="order?.status === 'unpaid'">
      <button class="action-btn cancel-btn" @click="handleCancel">
        取消订单
      </button>
      <button class="action-btn pay-btn" @click="handlePay">立即支付</button>
    </view>
    <view class="actions-section" v-if="canRefund">
      <button class="action-btn refund-btn" @click="showRefundReason = true">
        申请退款
      </button>
    </view>

    <!-- 退款原因弹窗 -->
    <view
      class="refund-mask"
      v-if="showRefundReason"
      @click="showRefundReason = false"
    >
      <view class="refund-popup" @click.stop>
        <text class="popup-title">申请退款</text>
        <textarea
          v-model="refundReason"
          class="refund-textarea"
          placeholder="选填，说明退款原因"
          placeholder-class="placeholder"
        />
        <view class="popup-actions">
          <button class="popup-btn cancel" @click="showRefundReason = false">
            取消
          </button>
          <button class="popup-btn confirm" @click="handleRequestRefund">
            提交
          </button>
        </view>
      </view>
    </view>
    </template>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-text">订单不存在</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  getOrderDetail,
  cancelOrder,
  payOrder,
  requestRefund,
} from "@/api/order";
import { Order, ORDER_STATUS_TEXT } from "@/types/order";
import { DELIVERY_TYPE_TEXT } from "@/utils/constants";
import { useUserStore } from "@/stores/user";
import { formatTime } from "@/utils/format";

const order = ref<Order | null>(null);
const orderId = ref("");
const loading = ref(true);
const showRefundReason = ref(false);
const refundReason = ref("");

const canRefund = computed(() => {
  const o = order.value;
  if (!o) return false;
  if (o.status !== "paid" && o.status !== "preparing") return false;
  const rs = (o as any).refundStatus;
  return !rs || rs === "none";
});

const userStore = useUserStore();
// 收货人：后端未返回时显示当前登录用户
const recipientName = computed(
  () => order.value?.contactName || userStore.userInfo?.nickName || "-"
);
const recipientPhone = computed(
  () => order.value?.contactPhone || userStore.userInfo?.phone || ""
);

const deliveryNo = computed(() => {
  const d = (order.value as any)?.deliveryId;
  if (d && typeof d === "object" && d.deliveryNo) return d.deliveryNo;
  return "";
});

onLoad((options) => {
  if (options.id) {
    orderId.value = options.id;
    fetchOrderDetail();
  }
});

// 获取订单详情
const fetchOrderDetail = async () => {
  loading.value = true;
  try {
    const data = await getOrderDetail(orderId.value);
    order.value = data;
  } catch (error) {
    console.error("获取订单详情失败:", error);
    uni.showToast({
      title: "加载失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
};

// 获取状态图标
const getStatusIcon = (status?: string) => {
  const iconMap: Record<string, string> = {
    unpaid: "⏰",
    paid: "⏳",
    preparing: "👨‍🍳",
    delivering: "🚚",
    completed: "✅",
    cancelled: "❌",
    refunded: "💰",
  };
  return iconMap[status || ""] || "📦";
};

// 获取状态文本
const getStatusText = (status?: string) => {
  return (
    ORDER_STATUS_TEXT[status as keyof typeof ORDER_STATUS_TEXT] || status || ""
  );
};

// 获取配送方式文本
const getDeliveryTypeText = (type?: string) => {
  return (
    DELIVERY_TYPE_TEXT[type as keyof typeof DELIVERY_TYPE_TEXT] || type || ""
  );
};

// 获取预计送达时间
const getDeliveryTime = () => {
  // TODO: 根据实际配送时间计算
  return "30分钟";
};

// 取消订单
const handleCancel = () => {
  uni.showModal({
    title: "确认取消",
    content: "确定要取消这个订单吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(orderId.value);
          uni.showToast({
            title: "已取消",
            icon: "success",
          });
          fetchOrderDetail();
        } catch (error) {
          console.error("取消订单失败:", error);
        }
      }
    },
  });
};

// 支付
const handlePay = async () => {
  try {
    const { payParams } = await payOrder(orderId.value);
    uni.requestPayment({
      provider: "wxpay",
      ...payParams,
      success: () => {
        uni.showToast({
          title: "支付成功",
          icon: "success",
        });
        fetchOrderDetail();
      },
    });
  } catch (error) {
    console.error("支付失败:", error);
  }
};

// 申请退款
const handleRequestRefund = async () => {
  try {
    await requestRefund(orderId.value, refundReason.value.trim() || undefined);
    showRefundReason.value = false;
    refundReason.value = "";
    uni.showToast({ title: "已提交退款申请", icon: "success" });
    fetchOrderDetail();
  } catch (error) {
    console.error("申请退款失败:", error);
  }
};
</script>

<style scoped lang="scss">
.track-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.loading-text,
.empty-text {
  font-size: 28rpx;
  color: #999999;
}

.status-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ffffff;
}

.status-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.icon-text {
  font-size: 60rpx;
}

.status-text {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.status-desc {
  font-size: 26rpx;
  opacity: 0.9;
}

.order-info-section,
.goods-section,
.delivery-section,
.price-section {
  background: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-size: 28rpx;
  color: #666666;
}

.info-value {
  font-size: 28rpx;
  color: #333333;
  
  &.selectable {
    user-select: text;
  }
  
  &.remark {
    max-width: 400rpx;
    text-align: right;
    word-break: break-all;
  }
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
  display: block;
}

.goods-item {
  display: flex;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.goods-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.goods-name {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.goods-spec {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.goods-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.goods-price {
  font-size: 26rpx;
  color: #ff6b6b;
}

.goods-quantity {
  font-size: 24rpx;
  color: #999999;
}

.delivery-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.delivery-no-row {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f5f5f5;
}

.delivery-no-row .info-label {
  margin-right: 16rpx;
}

.delivery-type {
  font-size: 28rpx;
  color: #333333;
}

.delivery-address {
  font-size: 26rpx;
  color: #666666;
}

.delivery-contact {
  font-size: 26rpx;
  color: #666666;
}

.delivery-recipient {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 8rpx;
}

.recipient-label {
  font-size: 26rpx;
  color: #666666;
  flex-shrink: 0;
}

.recipient-value {
  font-size: 26rpx;
  color: #333333;
}

.recipient-section {
  background: #ffffff;
  padding: 24rpx 30rpx;
}

.recipient-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 0;

  &:not(:last-child) {
    border-bottom: 1rpx solid #f5f5f5;
  }
}

.recipient-section .recipient-label {
  font-size: 28rpx;
  color: #999999;
  flex-shrink: 0;
  width: 120rpx;
}

.recipient-section .recipient-value {
  font-size: 28rpx;
  color: #333333;
  text-align: right;
  flex: 1;
  margin-left: 24rpx;
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

.actions-section {
  padding: 30rpx;
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }
}

.cancel-btn {
  background: #f5f5f5;
  color: #666666;
}

.pay-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.refund-section {
  background: #fff3e0;
  padding: 24rpx 30rpx;
  margin: 0 30rpx 20rpx;
  border-radius: 12rpx;
}

.refund-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.refund-value {
  font-size: 28rpx;
  font-weight: bold;
  &.pending {
    color: #ff9500;
  }
  &.approved {
    color: #52c41a;
  }
  &.rejected {
    color: #999;
  }
}

.refund-reason {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 8rpx;
}

.refund-btn {
  background: #ff9500;
  color: #ffffff;
}

.refund-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.refund-popup {
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 24rpx;
}

.refund-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  font-size: 28rpx;
  margin-bottom: 24rpx;
}

.placeholder {
  color: #bbb;
}

.popup-actions {
  display: flex;
  gap: 20rpx;
}

.popup-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  border: none;
  &::after {
    border: none;
  }
  &.cancel {
    background: #f5f5f5;
    color: #666;
  }
  &.confirm {
    background: #667eea;
    color: #fff;
  }
}
</style>

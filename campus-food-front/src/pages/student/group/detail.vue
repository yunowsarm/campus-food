<template>
  <view class="group-detail-container">
    <!-- 创建拼单模式：商品信息 + 创建表单 -->
    <template v-if="isCreateMode">
      <view class="food-section">
        <image
          class="food-image"
          :src="foodDetail?.images?.[0] || '/static/logo.png'"
          mode="aspectFill"
        />
        <view class="food-info">
          <text class="food-name">{{ foodDetail?.name }}</text>
          <text class="food-price"
            >¥{{
              foodDetail
                ? ((foodDetail.groupPrice ?? foodDetail.price) / 100).toFixed(2)
                : "0.00"
            }}</text
          >
        </view>
      </view>
      <view class="create-form-section">
        <text class="section-title">成团人数</text>
        <view class="target-num-row">
          <view
            v-for="n in 9"
            :key="n"
            class="target-num-item"
            :class="{ active: createForm.targetNum === n + 1 }"
            @click="createForm.targetNum = n + 1"
          >
            {{ n + 1 }}人
          </view>
        </view>
        <text class="section-title">配送方式</text>
        <view class="delivery-options">
          <view
            v-for="item in deliveryOptions"
            :key="item.value"
            class="delivery-option"
            :class="{ active: createForm.deliveryType === item.value }"
            @click="
              createForm.deliveryType = item.value;
              if (item.value === 'pickup') {
                createForm.campusAddressId = '';
                createForm.selectedAddress = '';
              }
            "
          >
            <text class="option-icon">{{ item.icon }}</text>
            <view class="option-info">
              <text class="option-name">{{ item.label }}</text>
              <text class="option-desc">{{ item.desc }}</text>
            </view>
            <text
              class="option-check"
              v-if="createForm.deliveryType === item.value"
              >✓</text
            >
          </view>
        </view>
        <!-- 单独配送/集体配送时选择配送地址 -->
        <view
          class="address-section"
          v-if="
            createForm.deliveryType === 'alone' ||
            createForm.deliveryType === 'together'
          "
        >
          <text class="section-title">配送地址</text>
          <picker
            mode="selector"
            :range="campusList"
            range-key="name"
            :value="addressPickerIndex"
            @change="onAddressPickerChange"
            class="address-picker"
          >
            <view class="address-item">
              <text class="address-text" v-if="createForm.selectedAddress">{{
                createForm.selectedAddress
              }}</text>
              <text class="address-placeholder" v-else>请选择配送地址</text>
              <text class="address-arrow">></text>
            </view>
          </picker>
        </view>
        <text class="section-title">拼单时长</text>
        <view class="duration-row">
          <view
            v-for="opt in durationOptions"
            :key="opt.value"
            class="duration-item"
            :class="{ active: createForm.duration === opt.value }"
            @click="createForm.duration = opt.value"
          >
            {{ opt.label }}
          </view>
        </view>
      </view>
      <view class="bottom-bar">
        <button
          class="action-btn share-btn submit-create-btn"
          :disabled="createSubmitting"
          @click="handleSubmitCreate"
        >
          {{ createSubmitting ? "处理中..." : "支付并发起拼单" }}
        </button>
      </view>
    </template>

    <!-- 拼单详情模式 -->
    <template v-else>
      <!-- 商品信息 -->
      <view class="food-section">
        <image
          class="food-image"
          :src="groupDetail?.food?.images[0] || '/static/logo.png'"
          mode="aspectFill"
        />
        <view class="food-info">
          <text class="food-name">{{ groupDetail?.food?.name }}</text>
          <text class="food-price"
            >¥{{
              groupDetail ? (groupDetail.price / 100).toFixed(2) : "0.00"
            }}</text
          >
        </view>
      </view>

      <!-- 拼单进度 -->
      <view class="progress-section">
        <view class="progress-header">
          <text class="progress-title">拼单进度</text>
          <text class="progress-count">
            {{ displayCurrentNum }}/{{ groupDetail?.targetNum }}人
          </text>
        </view>
        <view class="progress-bar">
          <view
            class="progress-fill"
            :style="{ width: `${getProgressPercent()}%` }"
          ></view>
        </view>
        <text class="progress-tip" v-if="groupDetail?.status !== 'success'">
          还差{{ (groupDetail?.targetNum || 0) - displayCurrentNum }}人成团
        </text>
        <text class="progress-tip" v-else
          >已满{{ groupDetail?.targetNum }}人，拼单成功</text
        >
      </view>

      <!-- 倒计时 / 成团状态：拼单完成后结束倒计时，显示下一步 -->
      <view
        class="countdown-section"
        :class="{ success: groupDetail?.status === 'success' }"
      >
        <template v-if="groupDetail?.status === 'success'">
          <text class="countdown-label">拼单状态</text>
          <text class="countdown-time success-text">已成团</text>
          <text class="next-step-tip">等待商家出餐</text>
        </template>
        <template
          v-else-if="
            (groupDetail?.remainingTime ?? 0) <= 0 &&
            groupDetail?.status === 'pending'
          "
        >
          <text class="countdown-label">拼单状态</text>
          <text class="countdown-time end-text">已结束（未成团）</text>
        </template>
        <template v-else>
          <text class="countdown-label">剩余时间</text>
          <text class="countdown-time">{{
            formatCountdown(groupDetail?.remainingTime || 0)
          }}</text>
        </template>
      </view>

      <!-- 本拼单配送方式（参与者不可改，按团长设定） -->
      <view class="delivery-section" v-if="!isCreator && groupDetail">
        <text class="section-title">本拼单配送方式</text>
        <view class="delivery-type-tag">
          <text class="delivery-type-label">{{
            getDeliveryTypeText(groupDetail.deliveryType)
          }}</text>
        </view>
        <!-- 集体配送：显示团长地址 -->
        <view
          v-if="groupDetail.deliveryType === 'together'"
          class="join-address-display"
        >
          <view class="address-label-row">
            <text class="address-label">团长配送地址</text>
          </view>
          <view class="address-content">
            <text class="address-icon">📍</text>
            <text class="address-text">{{ getCreatorAddress() }}</text>
          </view>
        </view>
        <!-- 单独配送：每人填写自己的地址 -->
        <view
          v-else-if="groupDetail.deliveryType === 'alone'"
          class="join-address-section"
        >
          <text class="section-title">请选择您的配送地址</text>
          <picker
            mode="selector"
            :range="campusList"
            range-key="name"
            :value="joinAddressPickerIndex"
            @change="onJoinAddressPickerChange"
            class="address-picker"
          >
            <view class="address-item">
              <text class="address-text" v-if="joinSelectedAddress">{{
                joinSelectedAddress
              }}</text>
              <text class="address-placeholder" v-else>请选择配送地址</text>
              <text class="address-arrow">></text>
            </view>
          </picker>
        </view>
        <!-- 到店自取：无需配送 -->
        <view
          v-else-if="groupDetail.deliveryType === 'pickup'"
          class="join-address-tip"
        >
          <text class="tip-text">到店自取，无需配送</text>
        </view>
      </view>

      <!-- 已参与用户 -->
      <view class="participants-section">
        <text class="section-title"
          >参与用户 ({{ groupDetail?.participants.length || 0 }})</text
        >
        <view class="participants-list">
          <view
            v-for="(participant, idx) in groupDetail?.participants"
            :key="participant.userId || idx"
            class="participant-item"
          >
            <image
              class="participant-avatar"
              :src="participant.avatarUrl || '/static/cover/cover.png'"
              mode="aspectFill"
            />
            <view class="participant-info">
              <text class="participant-name">{{ participant.nickName }}</text>
              <text class="participant-delivery">{{
                getDeliveryTypeText(participant.deliveryType)
              }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 拼单规则 -->
      <view class="rules-section">
        <text class="section-title">拼单规则</text>
        <view class="rules-content">
          <text class="rule-item"
            >1. 团长先付款再发布拼单；参与者点击「立即参与」后需完成支付</text
          >
          <text class="rule-item"
            >2. 人数满即成团，成团后等待商家出餐，无需再次支付</text
          >
          <text class="rule-item">3. 拼单失败或取消，已支付金额将原路退回</text>
          <text class="rule-item"
            >4. 发起人选定配送方式与地址，参与者按规则选择</text
          >
        </view>
      </view>

      <!-- 底部操作栏：参与时已支付，成团后无需再支付，等待出餐 -->
      <view class="bottom-bar">
        <template v-if="groupDetail?.status === 'success'">
          <button v-if="isParticipated" class="action-btn joined-btn" disabled>
            拼单已完成
          </button>
          <button v-else class="action-btn joined-btn" disabled>
            拼单已结束
          </button>
        </template>
        <template v-else>
          <template v-if="isCreator">
            <button class="action-btn share-btn" @click="handleShare">
              分享邀请
            </button>
            <button class="action-btn cancel-btn" @click="handleCancel">
              取消拼单
            </button>
          </template>
          <template v-else>
            <button
              v-if="!isParticipated"
              class="action-btn join-btn"
              @click="handleJoin"
            >
              立即参与
            </button>
            <button v-else class="action-btn joined-btn" disabled>
              已参与
            </button>
          </template>
        </template>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import {
  getGroupDetail,
  createGroup,
  joinGroup,
  cancelGroup,
} from "@/api/group";
import { createOrder } from "@/api/order";
import { getFoodDetail } from "@/api/food";
import { getCampusAddressList } from "@/api/campusAddresses";
import { GroupDetail, DeliveryType } from "@/types/group";
import { DELIVERY_TYPE_TEXT, STORAGE_KEYS } from "@/utils/constants";
import { formatCountdown } from "@/utils/format";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const groupDetail = ref<GroupDetail | null>(null);
const groupId = ref("");
const foodId = ref("");
const action = ref("");
const selectedDeliveryType = ref<DeliveryType>("together");

const isCreateMode = ref(false);
const foodDetail = ref<{
  id: string;
  name: string;
  price: number;
  groupPrice?: number;
  images?: string[];
} | null>(null);
const createForm = ref({
  targetNum: 2,
  deliveryType: "together" as DeliveryType,
  duration: 60,
  campusAddressId: "",
  selectedAddress: "",
});
const createSubmitting = ref(false);

// 校园配送点列表（创建拼单 + 参与拼单单独配送时选择地址）
const campusList = ref<Array<{ id: string; name: string }>>([]);
const addressPickerIndex = computed(() => {
  if (!createForm.value.campusAddressId || !campusList.value.length) return 0;
  const i = campusList.value.findIndex(
    (a) => a.id === createForm.value.campusAddressId,
  );
  return i >= 0 ? i : 0;
});
// 参与拼单时选择的地址（单独配送每人填自己的地址）
const joinCampusAddressId = ref("");
const joinSelectedAddress = ref("");
const joinAddressPickerIndex = computed(() => {
  if (!joinCampusAddressId.value || !campusList.value.length) return 0;
  const i = campusList.value.findIndex(
    (a) => a.id === joinCampusAddressId.value,
  );
  return i >= 0 ? i : 0;
});

const durationOptions = [
  { value: 30, label: "30分钟" },
  { value: 60, label: "1小时" },
  { value: 120, label: "2小时" },
  { value: 180, label: "3小时" },
];

const deliveryOptions = [
  {
    value: "alone" as DeliveryType,
    label: DELIVERY_TYPE_TEXT.alone,
    icon: "🚚",
    desc: "单独配送到指定地址",
  },
  {
    value: "together" as DeliveryType,
    label: DELIVERY_TYPE_TEXT.together,
    icon: "📦",
    desc: "集体配送，统一地址",
  },
  {
    value: "pickup" as DeliveryType,
    label: DELIVERY_TYPE_TEXT.pickup,
    icon: "🏪",
    desc: "到店自取",
  },
];

const isCreator = computed(() => {
  if (!groupDetail.value) return false;
  const myId = userStore.userInfo?.id;
  if (!myId) return false;
  const creatorId = groupDetail.value.creatorId;
  return String(creatorId) === String(myId);
});

const isParticipated = computed(() => {
  if (!groupDetail.value) return false;
  const myId = userStore.userInfo?.id;
  if (!myId) return false;
  return (groupDetail.value.participants || []).some(
    (p) => String(p.userId) === String(myId),
  );
});

const onJoinAddressPickerChange = (e: { detail: { value: string } }) => {
  const idx = Number(e.detail.value);
  if (campusList.value[idx]) {
    const a = campusList.value[idx];
    joinCampusAddressId.value = a.id;
    joinSelectedAddress.value = a.name;
  }
};

onLoad((options) => {
  const id = options.id;
  if (id && id !== "undefined" && id !== "null") {
    groupId.value = id;
    fetchGroupDetail();
  } else if (options.foodId && options.action === "create") {
    foodId.value = options.foodId;
    action.value = options.action || "";
    isCreateMode.value = true;
    fetchFoodDetail();
    loadCampusList();
  }
});

const loadCampusList = async () => {
  try {
    const list = await getCampusAddressList();
    campusList.value = (list || []).map(
      (a: { _id?: string; id?: string; name: string }) => ({
        id: (a as { _id?: string })._id || (a as { id?: string }).id || "",
        name: a.name,
      }),
    );
  } catch (e) {
    campusList.value = [];
  }
};

const onAddressPickerChange = (e: { detail: { value: string } }) => {
  const idx = Number(e.detail.value);
  if (campusList.value[idx]) {
    const a = campusList.value[idx];
    createForm.value.campusAddressId = a.id;
    createForm.value.selectedAddress = a.name;
  }
};

const fetchFoodDetail = async () => {
  if (!foodId.value) return;
  try {
    const data = await getFoodDetail(foodId.value);
    foodDetail.value = {
      id: (data as { id?: string }).id || (data as { _id?: string })._id || "",
      name: (data as { name: string }).name,
      price: (data as { price: number }).price,
      groupPrice: (data as { groupPrice?: number }).groupPrice,
      images: (data as { images?: string[] }).images,
    };
  } catch (e) {
    console.error("获取美食详情失败:", e);
    uni.showToast({ title: "加载失败", icon: "none" });
  }
};

const handleSubmitCreate = async () => {
  if (!foodId.value || createSubmitting.value) return;
  const needAddress =
    createForm.value.deliveryType === "alone" ||
    createForm.value.deliveryType === "together";
  if (needAddress && !createForm.value.campusAddressId) {
    uni.showToast({ title: "请选择配送地址", icon: "none" });
    return;
  }
  createSubmitting.value = true;
  try {
    const endTime = new Date(
      Date.now() + createForm.value.duration * 60 * 1000,
    ).toISOString();
    // 团长先付款再发布：先创建订单，跳转支付，支付成功后带 creatorOrderId 创建拼单
    const order = await createOrder({
      items: [{ foodId: foodId.value, quantity: 1 }],
      deliveryType: createForm.value.deliveryType,
      campusAddressId: needAddress
        ? createForm.value.campusAddressId
        : undefined,
    });
    const oid =
      (order as { id?: string }).id || (order as { _id?: string })._id;
    if (!oid) {
      uni.showToast({ title: "订单创建异常", icon: "none" });
      return;
    }
    uni.setStorageSync(STORAGE_KEYS.PENDING_CREATE_GROUP, {
      orderId: oid,
      foodId: foodId.value,
      targetNum: createForm.value.targetNum,
      duration: createForm.value.duration,
      deliveryType: createForm.value.deliveryType,
      campusAddressId: needAddress
        ? createForm.value.campusAddressId
        : undefined,
      endTime,
    });
    uni.redirectTo({
      url: `/pages/student/order/pay?orderId=${oid}&fromCreateGroup=1`,
    });
  } catch (e) {
    console.error("创建订单失败:", e);
    uni.showToast({ title: "创建失败", icon: "none" });
  } finally {
    createSubmitting.value = false;
  }
};

// 获取拼单详情
const fetchGroupDetail = async () => {
  try {
    const data = await getGroupDetail(groupId.value);
    // 归一化：后端可能返回 _id；creatorId/userId 可能为 ObjectId 或对象（populate），统一为字符串便于 isCreator/isParticipated 比较
    const raw = data as {
      id?: string;
      _id?: string;
      creatorId?: unknown;
      participants?: Array<{ userId?: unknown }>;
    };
    const getStrId = (v: unknown): string =>
      v == null
        ? ""
        : typeof v === "object" && v !== null && "_id" in v
          ? String((v as { _id: unknown })._id)
          : String(v);
    const normalized = {
      ...data,
      id: raw.id || raw._id,
      creatorId: getStrId(raw.creatorId),
      participants: (raw.participants || []).map((p) => ({
        ...p,
        userId: getStrId(p.userId),
      })),
    };
    groupDetail.value = normalized as GroupDetail;

    if (isCreator.value) {
      selectedDeliveryType.value = normalized.deliveryType;
    }
    // 参与者 + 单独配送：加载校园地址列表供选择
    if (!isCreateMode.value && normalized.deliveryType === "alone") {
      loadCampusList();
    }

    // 定时更新剩余时间（成团或已结束则不再倒计时）
    const timer = setInterval(() => {
      const g = groupDetail.value;
      if (
        !g ||
        g.status === "success" ||
        g.status === "failed" ||
        g.status === "cancelled"
      ) {
        clearInterval(timer);
        return;
      }
      const end = new Date(g.endTime).getTime();
      const now = Date.now();
      const diff = Math.floor((end - now) / 1000);
      groupDetail.value!.remainingTime = Math.max(0, diff);
      if (diff <= 0) clearInterval(timer);
    }, 1000);
  } catch (error) {
    console.error("获取拼单详情失败:", error);
    uni.showToast({
      title: "加载失败",
      icon: "none",
    });
  }
};

// 当前人数：优先用接口返回的 currentNum，否则用参与人数（含发起人）
const displayCurrentNum = computed(() => {
  const g = groupDetail.value;
  if (!g) return 0;
  const num = g.currentNum ?? g.participants?.length ?? 0;
  return Math.min(num, g.targetNum);
});

// 获取进度百分比
const getProgressPercent = () => {
  if (!groupDetail.value) return 0;
  return (displayCurrentNum.value / groupDetail.value.targetNum) * 100;
};

// 获取配送方式文本
const getDeliveryTypeText = (type: DeliveryType) => {
  return DELIVERY_TYPE_TEXT[type] || type;
};

// 获取团长的配送地址
const getCreatorAddress = () => {
  if (!groupDetail.value) return "暂无地址信息";
  
  // 从参与者列表中找到团长（userId 等于 creatorId）
  const creator = groupDetail.value.participants?.find(
    (p) => String(p.userId) === String(groupDetail.value.creatorId)
  );
  
  return creator?.address || "暂无地址信息";
};

// 参与拼单
const handleJoin = async () => {
  if (!userStore.userInfo?.id) {
    uni.showToast({ title: "请先登录", icon: "none" });
    return;
  }
  const g = groupDetail.value;
  if (!g) return;
  const deliveryType = g.deliveryType;
  // 单独配送时必选地址
  if (deliveryType === "alone" && !joinCampusAddressId.value) {
    uni.showToast({ title: "请选择配送地址", icon: "none" });
    return;
  }

  try {
    await joinGroup(groupId.value, {
      deliveryType,
      campusAddressId:
        deliveryType === "alone" ? joinCampusAddressId.value : undefined,
    });
    uni.showToast({
      title: "参与成功",
      icon: "success",
    });
    // 跳转到支付页面
    uni.navigateTo({
      url: `/pages/student/order/pay?groupId=${groupId.value}&type=group`,
    });
  } catch (error) {
    console.error("参与拼单失败:", error);
    uni.showToast({
      title: "参与失败",
      icon: "none",
    });
  }
};

// 成团后去支付
const goPay = () => {
  uni.navigateTo({
    url: `/pages/student/order/pay?groupId=${groupId.value}&type=group`,
  });
};

// 分享邀请（微信小程序使用右上角菜单分享）
const handleShare = () => {
  if (typeof uni.showShareMenu === "function") {
    uni.showShareMenu({ withShareTicket: true });
  }
  uni.showToast({ title: "请点击右上角分享", icon: "none" });
};

onShareAppMessage(() => {
  return {
    title: `快来和我一起拼单：${groupDetail.value?.food?.name || "校园美食"}`,
    path: `/pages/student/group/detail?id=${groupId.value}`,
    imageUrl: groupDetail.value?.food?.images?.[0],
  };
});

// 取消拼单
const handleCancel = () => {
  uni.showModal({
    title: "确认取消",
    content: "确定要取消这个拼单吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelGroup(groupId.value);
          uni.showToast({
            title: "已取消",
            icon: "success",
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          console.error("取消拼单失败:", error);
        }
      }
    },
  });
};
</script>

<style scoped lang="scss">
.group-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;
}

.food-section {
  background: #ffffff;
  padding: 30rpx;
  display: flex;
  margin-bottom: 20rpx;
}

.food-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.food-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.food-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.food-price {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.progress-section {
  background: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.progress-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.progress-count {
  font-size: 28rpx;
  color: #ff6b6b;
}

.progress-bar {
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 15rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-tip {
  font-size: 24rpx;
  color: #999999;
}

.countdown-section {
  background: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12rpx;
}

.countdown-section.success {
  flex-direction: column;
  align-items: flex-start;
}

.countdown-label {
  font-size: 28rpx;
  color: #666666;
}

.countdown-time {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.countdown-time.success-text {
  color: #07c160;
  font-size: 34rpx;
}

.countdown-time.end-text {
  color: #999999;
}

.next-step-tip {
  font-size: 26rpx;
  color: #667eea;
  margin-top: 8rpx;
  width: 100%;
}

.delivery-section,
.participants-section,
.rules-section {
  background: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.delivery-type-tag {
  margin-bottom: 20rpx;
}

.delivery-type-label {
  font-size: 30rpx;
  color: #667eea;
  font-weight: bold;
}

.join-address-tip {
  padding: 20rpx 0;
}

.join-address-tip .tip-text {
  font-size: 26rpx;
  color: #999999;
}

.join-address-display {
  margin-top: 20rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  border-radius: 16rpx;
  border: 2rpx solid #e5e5e5;
}

.address-label-row {
  margin-bottom: 16rpx;
}

.address-label {
  font-size: 26rpx;
  color: #666666;
  font-weight: 500;
}

.address-content {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.address-icon {
  font-size: 32rpx;
  line-height: 1;
}

.join-address-display .address-text {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  flex: 1;
  line-height: 1.5;
}

.join-address-section {
  margin-top: 20rpx;
}

.join-address-section .section-title {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 20rpx;
}

.delivery-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 20rpx;
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
  font-size: 40rpx;
  margin-right: 20rpx;
}

.option-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.option-name {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.option-desc {
  font-size: 24rpx;
  color: #999999;
}

.option-check {
  font-size: 32rpx;
  color: #667eea;
}

.address-section {
  margin-top: 20rpx;
  margin-bottom: 20rpx;
}

.address-section .section-title {
  margin-bottom: 20rpx;
}

.address-picker {
  width: 100%;
}

.address-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
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

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.participant-item {
  display: flex;
  align-items: center;
}

.participant-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
}

.participant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.participant-name {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.participant-delivery {
  font-size: 24rpx;
  color: #999999;
}

.rules-content {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.rule-item {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
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

  &[disabled] {
    background: #f5f5f5;
    color: #999999;
  }
}

.share-btn,
.join-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666666;
}

.joined-btn {
  background: #e8f5e9;
  color: #52c41a;
}

.create-form-section {
  background: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.target-num-row,
.duration-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.target-num-item,
.duration-item {
  padding: 16rpx 28rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  font-size: 26rpx;
  color: #666666;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }
}

.submit-create-btn {
  flex: none;
  width: 100%;
}
</style>

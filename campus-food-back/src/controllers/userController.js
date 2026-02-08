const User = require('../models/User');
//个人资料获取/更新
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.userId)
      .select('-__v')
      .populate('defaultAddressId', 'name phone region detail')
      .populate('merchantId', 'name logo address');
    if (!user) return res.status(404).json({ code: 404, message: '用户不存在' });
    res.json({
      code: 0,
      data: {
        id: user._id,
        email: user.email,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        role: user.role,
        defaultAddressId: user.defaultAddressId,
        merchantId: user.merchantId,
        deliveryStatus: user.deliveryStatus,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { nickName, avatarUrl, phone, defaultAddressId } = req.body;
    const update = {};
    if (nickName !== undefined) update.nickName = nickName;
    if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;
    if (phone !== undefined) update.phone = phone;
    if (defaultAddressId !== undefined) update.defaultAddressId = defaultAddressId;
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true })
      .select('-__v -password');
    if (!user) return res.status(404).json({ code: 404, message: '用户不存在' });
    res.json({
      code: 0,
      data: {
        id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };

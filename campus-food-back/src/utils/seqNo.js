/**
 * 生成订单号、配送单号等业务编号
 */
function pad(num, len = 4) {
  return String(num).padStart(len, "0");
}

function datePrefix() {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1, 2);
  const day = pad(d.getDate(), 2);
  const h = pad(d.getHours(), 2);
  const min = pad(d.getMinutes(), 2);
  const s = pad(d.getSeconds(), 2);
  return `${y}${m}${day}${h}${min}${s}`;
}

function orderNo(seq = 0) {
  return `ORD${datePrefix()}${pad(seq)}`;
}

/** 配送单号：时间到秒 + 毫秒 + 2位随机，避免同秒内重复 */
function deliveryNo() {
  const d = new Date();
  const prefix = datePrefix();
  const ms = pad(d.getMilliseconds(), 3);
  const rnd = pad(Math.floor(Math.random() * 100), 2);
  return `DEL${prefix}${ms}${rnd}`;
}

module.exports = { orderNo, deliveryNo, datePrefix };

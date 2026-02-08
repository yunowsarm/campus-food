function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.name === "ValidationError") {
    const msg = Object.values(err.errors)
      .map((e) => e.message)
      .join("; ");
    return res.status(400).json({ code: 400, message: msg || "参数校验失败" });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ code: 400, message: "参数格式错误" });
  }
  if (err.code === 11000) {
    return res.status(400).json({ code: 400, message: "数据已存在（重复）" });
  }
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || "服务器错误",
  });
}

module.exports = errorHandler;

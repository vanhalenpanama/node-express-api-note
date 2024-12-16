const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || '서버 오류가 발생했습니다'
  });
};

module.exports = errorHandler;

// 设置CORS头部，允许所有域名访问
function setCorsHeaders(request, response, next) {
    response.setHeader('Access-Control-Allow-Origin', '*'); // 允许所有域名访问
    response.setHeader('Access-Control-Allow-Methods', '*');
    response.setHeader('Access-Control-Allow-Headers', '*');
    next();
  }
  
  // 导出中间件函数
  module.exports = setCorsHeaders;
  
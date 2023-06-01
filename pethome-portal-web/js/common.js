// 配置请求的基本路径
axios.defaults.baseURL = "http://localhost:8080/";
// 自定义一个vue的属性 将axios赋值给我们自定义的属性
Vue.prototype.$http = axios
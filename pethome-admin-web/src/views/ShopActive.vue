<template>
  <div>
    <h1>恭喜您，正在激活店铺！</h1>
  </div>
</template>

<script>
export default {
  //模型数据
  data() {

    return {

    };
  },
  methods: {
    goActive(shopId){
      this.$http.get("/shop/active/" + shopId).then(res => {
        if(!res.data.success){
          this.$message.error("激活失败，请联系管理员！");
        } else {
          this.$message.success("激活成功，请登陆！");
          this.$router.push({ path: '/login' });
        }
      }).catch(res => {
        this.$message.error("网络繁忙，请稍后重试！");
      })
    }
  },
  mounted() {
    // 先拿到访问地址中的shopId
    let url = location.href;
    let shopId = url.split("=")[1];
    this.goActive(shopId);
  }
}

</script>
<style lang="scss" scoped>
.login-container {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  margin: 180px auto;
  width: 500px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
  .title {
    margin: 0px auto 40px auto;
    text-align: center;
    color: #505458;
  }
  .remember {
    margin: 0px 0px 35px 0px;
  }
}

.map {
  width: 100%;
  height: 300px;
}
.searchinput{
  width: 300px;
  box-sizing: border-box;
  padding: 9px;
  border: 1px solid #dddee1;
  line-height: 20px;
  font-size: 16px;
  height: 38px;
  color: #333;
  position: relative;
  border-radius: 4px;
}
</style>
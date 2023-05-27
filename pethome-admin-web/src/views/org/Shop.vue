<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="keyword" placeholder="关键字"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getShopsBySearch">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="shops" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
              style="width: 100%;">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column type="index" label="序号" width="60">
      </el-table-column>
      <el-table-column prop="name" label="店铺名称" width="140" sortable>
      </el-table-column>
      <el-table-column prop="tel" label="店铺电话" width="140" sortable>
      </el-table-column>
      <el-table-column prop="registerTime" label="注册时间" width="180" sortable>
      </el-table-column>
      <el-table-column label="状态" width="120" sortable>
        <template scope="scope">
          <span v-if="scope.row.state === 1" style="color: #50bfff">待审核</span>
          <span v-else-if="scope.row.state === 2" style="color: #50bfff">待激活</span>
          <span v-else-if="scope.row.state === 3" style="color: green">已激活</span>
          <span v-else style="color: red">驳回</span>
        </template>
      </el-table-column>
      <el-table-column prop="admin.username" label="店铺经理" width="120" sortable>
      </el-table-column>
      <el-table-column prop="logo" label="店铺图标" min-width="160" sortable>
        <template scope="scope">
          <el-image :src="'http://service-file-primary.java.itsource.cn/'+scope.row.logo" style="weight: 40px; height: 40px;"></el-image>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"
                     :page-size="pageSize"
                     :total="total"
                     :current-page="currentPage"
                     style="float:right;">
      </el-pagination>
    </el-col>

    <!--新增&编辑界面-->
    <el-dialog :title="title" :visible.sync="saveFormVisible" :close-on-click-modal="false">
      <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
        <el-form-item label="店铺名称" prop="name">
          <el-input v-model="saveForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="店铺电话" prop="tel">
          <el-input v-model="saveForm.tel" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="saveForm.state">
            <el-radio class="radio" :label="1">启用</el-radio>
            <el-radio class="radio" :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="店铺地址" prop="address">
          <el-input v-model="saveForm.address" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="管理员">
          <el-select v-model="saveForm.adminId" placeholder="请选择">
            <el-option
                v-for="item in employees"
                :key="item.id"
                :label="item.username"
                :value="item.id">
              <span style="float: left">{{ item.username }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.phone }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <!--文件上传-->
        <el-form-item prop="logo" label="店铺Logo">
          <el-upload
              class="upload-demo"
              action="http://localhost:8080/fastdfs/"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :file-list="fileList"
              list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="saveFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="saveSubmit" :loading="saveLoading">提交</el-button>
      </div>
    </el-dialog>

  </section>
</template>

<script>
import util from '../../common/js/util'

export default {
  data() {
    return {
      shops: [],
      employees: [],
      keyword: '',
      total: 0,
      pageSize: 5,
      currentPage: 1,
      listLoading: false,
      // 列表选中列
      sels: [],
      // 新增/修改页面的表头
      title: '',
      // 新增&编辑界面是否显示
      saveFormVisible: false,
      saveLoading: false,
      fileList: [],
      saveFormRules: {
        name: [
          {required: true, message: '请输入店铺名称', trigger: 'blur'}
        ],
        tel: [
          {required: true, message: '请输入店铺电话', trigger: 'blur'}
        ]
      },
      // 编辑界面数据
      saveForm: {
        id: null,
        name: '',
        tel: '',
        state: 0,
        address:'',
        logo: null,
        adminId: null
      }
    }
  },
  methods: {
    //文件上传成功回调
    handleSuccess(response, file, fileList) {
      this.saveForm.logo = response.data;
    },
    //文件删除
    handleRemove(file, fileList) {
      var filePath = file.response.data;
      this.$http.delete("fastdfs?path=" + filePath)
          .then(res => {
            if (res.data.success) {
              this.$message({
                message: '删除成功!',
                type: 'success'
              });
            } else {
              this.$message({
                message: '删除失败!',
                type: 'error'
              });
            }
          })
    },
    //图片预览
    handlePreview(file) {
      console.log(file);
    },
    // 分页点击事件
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getShops();
    },
    // 获取列表
    getShops() {
      let para = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        keyword: this.keyword
      };
      // 开启忙等
      this.listLoading = true;
      // 发送异步请求
      this.$http.post("/shop", para)
          .then(res => {
            this.total = res.data.total
            this.shops = res.data.data

            // 关闭忙等
            this.listLoading = false
          })
          .catch(res => {
            this.$message.error("网络繁忙，请稍后重试！")
          })


    },
    // 条件查询，设置当前页为第一页
    getShopsBySearch() {
      this.currentPage = 1;
      this.getShops();
    },
    // 删除
    handleDel: function (index, row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();
        this.$http.delete("shop/" + row.id)
            .then(res => {
              let result = res.data
              // 判断后端删除是否成功
              if (result.success) {
                this.$message.success(result.message)
                // 判断删除数据是否是最后一页的最后一条数据
                // 判断是否是最后一页 最后一条数据 不是第一页
                let maxPage = Math.ceil(this.total / this.pageSize)
                if (maxPage === this.currentPage && (this.total - 1) % this.pageSize === 0 && this.currentPage > 1) {
                  this.currentPage = this.currentPage - 1
                }
                this.getShops();
              } else {
                // 后端返回删除失败
                this.$message.error(result.message)
              }
            })
            .catch(res => {
              this.$message.error("网络繁忙，请稍后重试！")
            })
      }).catch(() => {

      });
    },
    // 批量删除
    batchRemove: function () {
      var ids = this.sels.map(item => item.id);
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();
        this.$http.patch("/shop", ids)
            .then(res => {
              let result = res.data
              // 判断后端删除是否成功
              if (result.success) {
                this.$message.success(result.message)
                // 判断删除数据是否是最后一页的最后数据，ids的数组长度就为删除的数据条数
                // 判断是否是最后一页 最后的数据 不是第一页
                let maxPage = Math.ceil(this.total / this.pageSize)
                if (maxPage === this.currentPage && (this.total - ids.length) % this.pageSize === 0 && this.currentPage > 1) {
                  this.currentPage = this.currentPage - 1
                }
                this.getShops();
              } else {
                // 后端返回删除失败
                this.$message.error(result.message)
              }
            })
            .catch(res => {
              this.$message.error("网络繁忙，请稍后重试！")
            })
      }).catch(() => {

      });
    },
    // 显示编辑界面
    handleEdit: function (index, row) {
      this.saveFormVisible = true;
      this.title = '编辑';
      this.saveForm = Object.assign({}, row)
    },
    // 显示新增界面
    handleAdd: function () {
      this.saveFormVisible = true;
      this.title = '新增';
      this.saveForm = {};
      // this.handleRemove();
    },
    // 新增&编辑的提交
    saveSubmit: function () {
      this.$refs.saveForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.saveLoading = true;
            let para = Object.assign({}, this.saveForm);
            this.$http.put("/shop", para)
                .then(res => {
                  if (res.data.success) {
                    this.$message.success("操作成功")
                  } else {
                    this.$message.error("操作失败")
                  }
                  this.saveLoading = false;
                  this.saveFormVisible = false;
                  this.getShops();
                })
                .catch(res => {
                  this.$message.error("网络繁忙，请稍后重试！")
                })
          });
        }
      });
    },
    // 复选框勾选
    selsChange: function (sels) {
      this.sels = sels;
    },
    // 获取员工数据
    getEmployees() {
      this.$http.get("/employee")
          .then(res => {
            this.employees = res.data;
          })
          .catch(res => {
            this.$message.error("网络繁忙，请稍后重试！")
          })
    }
  },
  mounted() {
    this.getShops();
    this.getEmployees();
  }
}

</script>

<style scoped>

</style>
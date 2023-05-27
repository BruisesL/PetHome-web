<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="keyword" placeholder="关键字"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getSdtsBySearch">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table @row-dblclick="showDetail" :data="sdts" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
              style="width: 100%;">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column type="index" label="序号" width="60">
      </el-table-column>
      <el-table-column prop="name" label="数据字典类型名称" width="200" sortable>
      </el-table-column>
      <el-table-column prop="sn" label="数据字典类型编码" width="200" sortable>
      </el-table-column>
      <el-table-column label="操作" width="150">
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
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="saveForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="类型编码" prop="sn">
          <el-input v-model="saveForm.sn" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="saveFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="saveSubmit" :loading="saveLoading">提交</el-button>
      </div>
    </el-dialog>

    <!-- 弹出字典明细数据 -->
    <el-dialog title="数据字典明细" :visible.sync="table" :close-on-click-modal="false">
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
        <el-form :inline="true">
          <el-form-item>
            <el-input v-model="keywordSdd" placeholder="字典明细名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-on:click="getSddsBySearch">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleAddSdd">新增</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <!--列表-->
      <el-table :data="sdds" highlight-current-row v-loading="listLoadingSdd"
                @selection-change="selsChangeSdd"
                style="width: 100%;">
        <el-table-column type="selection" width="55">
        </el-table-column>
        <el-table-column type="index" width="60">
        </el-table-column>
        <el-table-column prop="name" label="数据字典明细名称" width="200">
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template scope="scope">
            <el-button size="small" @click="handleEditSdd(scope.$index, scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelSdd(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--工具条-->
      <el-col :span="24" class="toolbar">
        <el-button type="danger" @click="batchRemoveSdd" :disabled="this.selsSdd.length===0">批量删除</el-button>
        <el-pagination layout="prev, pager, next" @current-change="handleCurrentChangeSdd"
                       :page-size="pageSizeSdd"
                       :total="totalSdd"
                       :current-page="currentPageSdd"
                       style="float:right;">
        </el-pagination>
      </el-col>
    </el-dialog>

    <!--数据字典明细的新增&编辑界面-->
    <el-dialog :title="titleSdd" :visible.sync="saveFormVisibleSdd" :close-on-click-modal="false">
      <el-form :model="saveFormSdd" label-width="80px" :rules="saveFormRulesSdd" ref="saveFormSdd">
        <el-form-item label="明细名称" prop="name">
          <el-input v-model="saveFormSdd.name" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="saveFormVisibleSdd = false">取消</el-button>
        <el-button type="primary" @click.native="saveSubmitSdd" :loading="saveLoadingSdd">提交</el-button>
      </div>
    </el-dialog>

  </section>
</template>

<script>

export default {
  data() {
    return {
      // 字典类型数据
      sdts: [],
      // 字典明细数据
      sdds: [],
      table: false,
      tableId: null,
      // 类型查询关键字
      keyword: '',
      // 明细查询关键字
      keywordSdd: '',
      total: 0,
      totalSdd: 0,
      pageSize: 5,
      pageSizeSdd: 5,
      currentPage: 1,
      currentPageSdd: 1,
      listLoading: false,
      listLoadingSdd: false,
      // 列表选中列
      sels: [],
      selsSdd: [],
      // 新增/修改页面的表头
      title: '',
      titleSdd: '',
      // 新增&编辑界面是否显示
      saveFormVisible: false,
      saveFormVisibleSdd: false,
      saveLoading: false,
      saveLoadingSdd: false,
      saveFormRules: {
        name: [
          {required: true, message: '请输入类型名称', trigger: 'blur'}
        ],
        sn: [
          {required: true, message: '请输入类型编码', trigger: 'blur'}
        ]
      },
      saveFormRulesSdd: {
        name: [
          {required: true, message: '请输入明细名称', trigger: 'blur'}
        ]
      },
      // 编辑界面数据
      saveForm: {
        id: null,
        name: '',
        sn: ''
      },
      saveFormSdd: {
        id: null,
        name: '',
        typesId: null
      }
    }
  },
  methods: {
    // 分页点击事件
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getSdts();
    },
    handleCurrentChangeSdd(val) {
      this.currentPageSdd = val;
      this.getSdds(this.tableId);
    },
    // 获取列表
    getSdts() {
      let para = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        keyword: this.keyword
      };
      // 开启忙等
      this.listLoading = true;
      // 发送异步请求
      this.$http.post("/sdt", para)
          .then(res => {
            this.total = res.data.total
            this.sdts = res.data.data
            // 关闭忙等
            this.listLoading = false
          })
          .catch(res => {
            this.$message.error("网络繁忙，请稍后重试！")
          })
    },
    // 条件查询，设置当前页为第一页
    getSdtsBySearch() {
      this.currentPage = 1;
      this.getSdts();
    },
    //获取列表
    getSdds(id) {
      let para = {
        currentPage: this.currentPageSdd,
        pageSize: this.pageSizeSdd,
        keyword: this.keywordSdd,
        typesId: id
      };
      this.listLoadingSdd = true;
      this.$http.post("/sdd", para)
          .then(res => {
            this.listLoadingSdd = false;
            this.totalSdd = res.data.total;
            this.sdds = res.data.data;
          })
          .catch(res => {
            this.$message.error("网络不通");
          });
    },
    // 条件查询，设置当前页为第一页
    getSddsBySearch() {
      this.currentPageSdd = 1;
      this.getSdds(this.tableId);
    },
    // 删除
    handleDel: function (index, row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();
        this.$http.delete("sdt/" + row.id)
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
                this.getSdts();
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
    handleDelSdd: function (index, row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoadingSdd = true;
        this.$http.delete("sdd/" + row.id)
            .then(res => {
              let result = res.data
              // 判断后端删除是否成功
              if (result.success) {
                this.$message.success(result.message)
                // 判断删除数据是否是最后一页的最后一条数据
                // 判断是否是最后一页 最后一条数据 不是第一页
                let maxPage = Math.ceil(this.totalSdd / this.pageSizeSdd)
                if (maxPage === this.currentPageSdd && (this.totalSdd - 1) % this.pageSizeSdd === 0 && this.currentPageSdd > 1) {
                  this.currentPageSdd = this.currentPageSdd - 1
                }
                this.getSdds(this.tableId);
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
        this.$http.patch("/sdt", ids)
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
                this.getSdts();
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
    batchRemoveSdd: function () {
      var ids = this.selsSdd.map(item => item.id);
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoadingSdd = true;
        this.$http.patch("/sdd", ids)
            .then(res => {
              let result = res.data
              // 判断后端删除是否成功
              if (result.success) {
                this.$message.success(result.message)
                // 判断删除数据是否是最后一页的最后数据，ids的数组长度就为删除的数据条数
                // 判断是否是最后一页 最后的数据 不是第一页
                let maxPage = Math.ceil(this.totalSdd / this.pageSizeSdd)
                if (maxPage === this.currentPageSdd && (this.totalSdd - ids.length) % this.pageSizeSdd === 0 && this.currentPageSdd > 1) {
                  this.currentPageSdd = this.currentPageSdd - 1
                }
                this.getSdds(this.tableId);
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
      this.saveForm = Object.assign({}, row);
    },
    handleEditSdd: function (index, row) {
      this.saveFormVisibleSdd = true;
      this.titleSdd = '编辑';
      this.saveFormSdd = Object.assign({}, row);
    },
    //显示新增界面
    handleAdd: function () {
      this.saveFormVisible = true;
      this.title = '新增';
      this.saveForm = {};
    },
    handleAddSdd: function () {
      this.saveFormVisibleSdd = true;
      this.titleSdd = '新增';
      this.saveFormSdd = {};
    },
    // 新增&编辑的提交
    saveSubmit: function () {
      this.$refs.saveForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.saveLoading = true;
            let para = Object.assign({}, this.saveForm);
            this.$http.put("/sdt", para)
                .then(res => {
                  if (res.data.success) {
                    this.$message.success("操作成功")
                  } else {
                    this.$message.error("操作失败")
                  }
                  this.saveLoading = false;
                  this.saveFormVisible = false;
                  this.currentPage = 1;
                  this.getSdts();
                })
                .catch(res => {
                  this.$message.error("网络繁忙，请稍后重试！")
                })
          });
        }
      });
    },
    saveSubmitSdd: function () {
      this.$refs.saveFormSdd.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.saveLoadingSdd = true;
            this.saveFormSdd.typesId = this.tableId;
            let para = Object.assign({}, this.saveFormSdd);
            this.$http.put("/sdd", para)
                .then(res => {
                  if (res.data.success) {
                    this.$message.success("操作成功")
                  } else {
                    this.$message.error("操作失败")
                  }
                  this.saveLoadingSdd = false;
                  this.saveFormVisibleSdd = false;
                  // this.keywordSdd = '';
                  this.currentPageSdd = 1;
                  this.getSdds(this.tableId);
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
    selsChangeSdd: function (sels) {
      this.selsSdd = sels;
    },
    // 显示明细界面
    showDetail(row) {
      this.table = true;
      this.tableId = row.id;
      this.keywordSdd = '';
      this.getSdds(row.id);
    }
  },
  mounted() {
    this.getSdts();
  }
}

</script>

<style scoped>

</style>
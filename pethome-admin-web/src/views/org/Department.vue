<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="keyword" placeholder="关键字"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getDepartmentsBySearch">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="departments" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
              style="width: 100%;">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column type="index" label="序号" width="60">
      </el-table-column>
      <el-table-column prop="name" label="部门名称" width="120" sortable>
      </el-table-column>
      <el-table-column prop="sn" label="部门编码" width="100" sortable>
      </el-table-column>
      <el-table-column label="状态" width="100" sortable>
        <template scope="scope">
          <span v-if="scope.row.state === 0" style="color: red">禁用</span>
          <span v-else style="color: green">启用</span>
        </template>
      </el-table-column>
      <el-table-column prop="manager.username" label="部门经理" width="120" sortable>
      </el-table-column>
      <el-table-column label="上级部门" min-width="180" sortable>
        <template scope="scope">
          <span v-if="scope.row.parentId == null" style="color: hotpink">顶级部门</span>
          <span v-else>{{ scope.row.parent.name }}</span>
        </template>
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
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="saveForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="部门编码" prop="sn">
          <el-input v-model="saveForm.sn" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="saveForm.state">
            <el-radio class="radio" :label="1">启用</el-radio>
            <el-radio class="radio" :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门经理">
          <el-select v-model="saveForm.managerId" placeholder="请选择">
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
        <el-form-item label="上级部门">
          <el-cascader
              v-model="saveForm.parentId"
              :options="tree"
              :props="{
                checkStrictly: true,
                label: 'name',
                value: 'id'
              }"
              clearable></el-cascader>
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

export default {
  data() {
    return {
      departments: [],
      employees: [],
      tree: [],
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
      saveFormRules: {
        name: [
          {required: true, message: '请输入部门名称', trigger: 'blur'}
        ],
        sn: [
          {required: true, message: '请输入部门编码', trigger: 'blur'}
        ]
      },
      // 编辑界面数据
      saveForm: {
        id: null,
        name: '',
        sn: '',
        state: 0,
        managerId: null,
        parentId: null
      }
    }
  },
  methods: {
    // 分页点击事件
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getDepartments();
    },
    // 获取列表
    getDepartments() {
      let para = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        keyword: this.keyword
      };
      // 开启忙等
      this.listLoading = true;
      // 发送异步请求
      this.$http.post("/department", para)
          .then(res => {
            this.total = res.data.total
            this.departments = res.data.data

            // 关闭忙等
            this.listLoading = false
          })
          .catch(res => {
            this.$message.error("网络繁忙，请稍后重试！")
          })


    },
    // 条件查询，设置当前页为第一页
    getDepartmentsBySearch() {
      this.currentPage = 1;
      this.getDepartments();
    },
    // 删除
    handleDel: function (index, row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();
        this.$http.delete("department/" + row.id)
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
                this.getDepartments();
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
        this.$http.patch("/department", ids)
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
                this.getDepartments();
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
    //显示新增界面
    handleAdd: function () {
      this.saveFormVisible = true;
      this.title = '新增';
      this.saveForm = {};
    },
    // 新增&编辑的提交
    saveSubmit: function () {
      this.$refs.saveForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.saveLoading = true;
            let para = Object.assign({}, this.saveForm);
            // 处理回显上级部门ID数据为数组的问题
            if (para.parentId && para.parentId instanceof Array) {
              para.parentId = para.parentId[para.parentId.length - 1]
            }
            this.$http.put("/department", para)
                .then(res => {
                  if (res.data.success) {
                    this.$message.success("操作成功")
                  } else {
                    this.$message.error("操作失败")
                  }
                  this.saveLoading = false;
                  this.saveFormVisible = false;
                  this.currentPage = 1;
                  this.getDepartments();
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
    },
    // 获取部门树
    getTree() {
      this.$http.get("/department/tree")
          .then(res => {
            this.tree = res.data;
          })
          .catch(res => {
            this.$message.error("网络繁忙，请稍后重试")
          })
    }
  },
  mounted() {
    this.getDepartments();
    this.getEmployees();
    this.getTree();
  }
}

</script>

<style scoped>

</style>
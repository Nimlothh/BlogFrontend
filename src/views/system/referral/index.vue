<template>
    <div class="app-container">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="职位名称" prop="jobTitle">
          <el-input
            v-model="queryParams.jobTitle"
            placeholder="请输入职位名称"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
  
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        </el-form-item>
      </el-form>
  
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增</el-button>
          </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="el-icon-edit"
            size="mini"
            :disabled="single"
            @click="handleUpdate"
          >修改</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            
          >导出</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
  
      <el-table v-loading="loading" :data="referralList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="内推ID" align="center" prop="referralID" />
        <el-table-column label="公司名称" align="center" prop="companyName" />
        <el-table-column label="职位名称" align="center" prop="jobTitle" />
        <el-table-column label="所在城市名称" align="center" prop="address" />
        <el-table-column label="薪资" align="center" prop="salary" />
        <el-table-column label="联系人电话" align="center" prop="contactNumber" />
        <el-table-column label="联系人名字" align="center" prop="contactName" />
        <el-table-column label="技术要求描述" align="center" prop="techRquirement" />
        <el-table-column label="开始时间" align="center" prop="startTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="center" prop="endTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" align="center" prop="referralStatus" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
             >修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
  
      <!-- 添加或修改【请填写功能名称】对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="公司名称" prop="companyName">
            <el-input v-model="form.companyName" placeholder="请输入公司名称" />
          </el-form-item>
          <el-form-item label="职位名称" prop="jobTitle">
            <el-input v-model="form.jobTitle" placeholder="请输入职位名称" />
          </el-form-item>
          <el-form-item label="所在城市名称" prop="address">
            <el-input v-model="form.address" placeholder="请输入所在城市名称" />
          </el-form-item>
          <el-form-item label="薪资" prop="salary">
            <el-input v-model="form.salary" placeholder="请输入薪资" />
          </el-form-item>
          <el-form-item label="联系人电话" prop="contactNumber">
            <el-input v-model="form.contactNumber" placeholder="请输入联系人电话" />
          </el-form-item>
          <el-form-item label="联系人名字" prop="contactName">
            <el-input v-model="form.contactName" placeholder="请输入联系人名字" />
          </el-form-item>
          <el-form-item label="技术要求描述" prop="techRquirement">
            <el-input v-model="form.techRquirement" type="textarea" placeholder="技术要求描述" />
          </el-form-item>
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker clearable
              v-model="form.startTime"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="请选择开始时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker clearable
              v-model="form.endTime"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="请选择结束时间">
            </el-date-picker>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { listReferral, getReferral, delReferral, addReferral, updateReferral,searchReffal } from "@/api/system/referral";
  
  export default {
    name: "Referral",
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 显示搜索条件
        showSearch: true,
        // 总条数
        total: 0,
        // 【请填写功能名称】表格数据
        referralList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          companyName: null,
          jobTitle: null,
          address: null,
          salary: null,
          contactNumber: null,
          contactName: null,
          techRquirements: null,
          startTime: null,
          endTime: null,
          referralStatus: null
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          companyName: [
            { required: true, message: "公司名称不能为空", trigger: "blur" }
          ],
          jobTitle: [
            { required: true, message: "职位名称不能为空", trigger: "blur" }
          ],
          address: [
            { required: true, message: "所在城市名称不能为空", trigger: "blur" }
          ],
          salary: [
            { required: true, message: "薪资不能为空", trigger: "blur" }
          ],
          contactNumber: [
            { required: true, message: "联系人电话不能为空", trigger: "blur" }
          ],
          contactName: [
            { required: true, message: "联系人名字不能为空", trigger: "blur" }
          ],
          techRquirements: [
            { required: true, message: "技术要求描述不能为空", trigger: "blur" }
          ],
          startTime: [
            { required: true, message: "开始时间不能为空", trigger: "blur" }
          ],
          endTime: [
            { required: true, message: "结束时间不能为空", trigger: "blur" }
          ],
          referralStatus: [
            { required: true, message: "审核状态不能为空", trigger: "change" }
          ]
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询【请填写功能名称】列表 */
      getList() {
        this.loading = true;
        listReferral(this.queryParams).then(response => {
          this.referralList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      searchList(){
        this.loading = true;
        searchReffal(this.queryParams).then(response => {
          this.referralList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.reset();
      },
      // 表单重置
      reset() {
        this.form = {
          referralID: null,
          companyName: null,
          jobTitle: null,
          address: null,
          salary: null,
          contactNumber: null,
          contactName: null,
          techRquirements: null,
          startTime: null,
          endTime: null,
          referralStatus: null
        };
        this.resetForm("form");
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1;
        this.searchList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
        this.handleQuery();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.referralID)
        this.single = selection.length!==1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加【请填写功能名称】";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const referralID = row.referralID || this.ids
        getReferral(referralID).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改【请填写功能名称】";
        });
      },
      /** 提交按钮 */
      submitForm() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.referralID != null) {
              updateReferral(this.form).then(response => {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              });
            } else {
              addReferral(this.form).then(response => {
                this.$modal.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              });
            }
          }
        });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const referralIDs = row.referralID || this.ids;
        this.$modal.confirm('是否确认删除【请填写功能名称】编号为"' + referralIDs + '"的数据项？').then(function() {
          return delReferral(referralIDs);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
      },
      /** 导出按钮操作 */
      handleExport() {
        this.download('system/referral/export', {
          ...this.queryParams
        }, `referral_${new Date().getTime()}.xlsx`)
      }
    }
  };
  </script>
  
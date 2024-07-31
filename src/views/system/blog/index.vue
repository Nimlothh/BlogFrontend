<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="博文标题" prop="postTitle">
        <el-input
          v-model="queryParams.postTitle"
          placeholder="请输入博文标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="博文作者" prop="postAuthor">
        <el-input
          v-model="queryParams.postAuthor"
          placeholder="请输入博文作者"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="博文提交日期" prop="postDate">
        <el-date-picker clearable
          v-model="queryParams.postDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="用户id" prop="userID">
        <el-input
          v-model="queryParams.userID"
          placeholder="请输入用户id"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
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
          v-hasPermi="['system:blog:add']"
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
          v-hasPermi="['system:blog:edit']"
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
          v-hasPermi="['system:blog:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:blog:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="blogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="博文id" align="center" prop="postID" />
      <el-table-column label="博文标题" align="center" prop="postTitle" />
      <el-table-column label="博文作者" align="center" prop="postAuthor" />
      <el-table-column label="博文提交日期" align="center" prop="postDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.postDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="" align="center" prop="postStatus" />
      <el-table-column label="用户id" align="center" prop="userID" />
      <el-table-column label="博文内容" align="center" prop="postContent" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:blog:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:blog:remove']"
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
        <el-form-item label="博文标题" prop="postTitle">
          <el-input v-model="form.postTitle" placeholder="请输入博文标题" />
        </el-form-item>
        <el-form-item label="博文作者" prop="postAuthor">
          <el-input v-model="form.postAuthor" placeholder="请输入${comment}" />
        </el-form-item>
        <el-form-item label="博文发表日期" prop="postDate">
          <el-date-picker clearable
            v-model="form.postDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择博文发表日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="用户id" prop="userID">
          <el-input v-model="form.userID" placeholder="请输入用户id" />
        </el-form-item>
        <el-form-item label="博文内容">
          <editor v-model="form.postContent" :min-height="192"/>
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
import { listBlog, getBlog, delBlog, addBlog, updateBlog } from "@/api/system/blog";

export default {
  name: "Blog",
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
      blogList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        postTitle: null,
        postAuthor: null,
        postDate: null,
        postStatus: null,
        userID: null,
        postContent: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        postTitle: [
          { required: true, message: "$comment不能为空", trigger: "blur" }
        ],
        postAuthor: [
          { required: true, message: "$comment不能为空", trigger: "blur" }
        ],
        postDate: [
          { required: true, message: "$comment不能为空", trigger: "blur" }
        ],
        postStatus: [
          { required: true, message: "$comment不能为空", trigger: "change" }
        ],
        userID: [
          { required: true, message: "$comment不能为空", trigger: "blur" }
        ],
        postContent: [
          { required: true, message: "$comment不能为空", trigger: "blur" }
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
      listBlog(this.queryParams).then(response => {
        this.blogList = response.rows;
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
        postID: null,
        postTitle: null,
        postAuthor: null,
        postDate: null,
        postStatus: null,
        userID: null,
        postContent: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.postID)
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
      const postID = row.postID || this.ids
      getBlog(postID).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改【请填写功能名称】";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.postID != null) {
            updateBlog(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addBlog(this.form).then(response => {
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
      const postIDs = row.postID || this.ids;
      this.$modal.confirm('是否确认删除【请填写功能名称】编号为"' + postIDs + '"的数据项？').then(function() {
        return delBlog(postIDs);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/blog/export', {
        ...this.queryParams
      }, `blog_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

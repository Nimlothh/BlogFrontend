import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listBlog(query) {
  return request({
    url: '/system/blog/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getBlog(postID) {
  return request({
    url: '/system/blog/' + postID,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addBlog(data) {
  return request({
    url: '/system/blog',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateBlog(data) {
  return request({
    url: '/system/blog',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delBlog(postID) {
  return request({
    url: '/system/blog/' + postID,
    method: 'delete'
  })
}

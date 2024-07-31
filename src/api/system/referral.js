import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listReferral(query) {
  return request({
    url: '/system/referral/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getReferral(referralID) {
  return request({
    url: '/system/referral/' + referralID,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addReferral(data) {
  return request({
    url: '/system/referral/addreferral',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateReferral(data) {
  return request({
    url: '/system/referral',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delReferral(referralID) {
  return request({
    url: '/system/referral/' + referralID,
    method: 'delete'
  })
}

export function searchReffal(query) {
  return request({
    url: '/system/referral',
    method: 'get',
    params:query
  })
}









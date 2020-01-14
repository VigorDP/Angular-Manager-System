import { _HttpClient, SettingsService } from '@delon/theme';
import { Injectable } from '@angular/core';

const PREFIX = '/hl/social/';

@Injectable({ providedIn: 'root' })
export class RestService {
  constructor(private http: _HttpClient, private settings: SettingsService) {}

  // 登录
  login = (params: any) => this.http.post(`${PREFIX}propertyAccount/login `, params);
  // 退出登录
  logout = () => this.http.get(`${PREFIX}propertyAccount/logout`);

  // 账号管理-获取列表
  getPropertyAccountList = (params: any) => this.http.post(`${PREFIX}propertyAccount/list`, params);
  // 账号管理-删除
  deletePropertyAccount = (params: any) => this.http.post(`${PREFIX}propertyAccount/delete`, params);
  // 账号管理-新增或修改
  savePropertyAccount = (params: any) => this.http.post(`${PREFIX}propertyAccount/save`, params);
  // 账号管理-详情
  getPropertyAccountInfo = (params: any) => this.http.get(`${PREFIX}propertyAccount/info`, params);

  // 角色管理-获取角色列表
  getRoleList = (params: any) => this.http.post(`${PREFIX}ramRole/list`, params);
  // 角色管理-删除角色
  deleteRole = (params: any) => this.http.post(`${PREFIX}ramRole/delete`, params);
  // 角色管理-新增或修改角色
  saveRole = (params: any) => this.http.post(`${PREFIX}ramRole/save`, params);
  // 角色管理-角色详情
  getRoleInfo = (params: any) => this.http.get(`${PREFIX}ramRole/info`, params);
  // 角色管理-获取用户操作权限列表
  getUserRightList = () => this.http.get(`${PREFIX}ramRole/user/rights`);

  // 社区管理-获取列表
  getSocialProjectList = (params: any) => this.http.post(`${PREFIX}social/list`, params);
  // 社区管理-删除
  deleteSocialProject = (params: any) => this.http.post(`${PREFIX}social/delete`, params);
  // 社区管理-新增或修改
  saveSocialProject = (params: any) => this.http.post(`${PREFIX}social/save`, params);
  // 社区管理-详情
  getSocialProjectInfo = (params: any) => this.http.get(`${PREFIX}social/info`, params);
  // 社区管理-房屋结构
  getSocialProjectStructure = (params?: any) =>
    this.http.get(`${PREFIX}social/building/list`, paramsWithExtraParams(params, this.settings.app.community));

  // 上传base64图像
  uploadBase64 = (params: any) => this.http.get(`${PREFIX}uploader/base64/upload`, params);

  // 楼栋结构-获取列表
  getBuildingList = (params: any) =>
    this.http.post(`${PREFIX}building/list`, paramsWithExtraParams(params, this.settings.app.community));
  // 楼栋结构-删除
  deleteBuilding = (params: any) => this.http.post(`${PREFIX}building/delete`, params);
  // 楼栋结构-新增或修改
  saveBuilding = (params: any) =>
    this.http.post(`${PREFIX}building/save`, paramsWithExtraParams(params, this.settings.app.community));
  // 楼栋结构-详情
  getBuildingInfo = (params: any) =>
    this.http.get(`${PREFIX}building/info`, paramsWithExtraParams(params, this.settings.app.community));
  // 楼栋结构-房屋结构
  getBuildingStructure = (params?: any) =>
    this.http.post(`${PREFIX}building/structure`, paramsWithExtraParams(params, this.settings.app.community));

  // 住户管理-获取列表
  getResidentList = (params: any) =>
    this.http.post(`${PREFIX}resident/list`, paramsWithExtraParams(params, this.settings.app.community));
  // 住户管理-删除
  deleteResident = (params: any) => this.http.post(`${PREFIX}resident/delete`, params);
  // 住户管理-新增或修改
  saveResident = (params: any) =>
    this.http.post(`${PREFIX}resident/save`, paramsWithExtraParams(params, this.settings.app.community));
  // 住户管理-详情
  getResidentInfo = (params: any) =>
    this.http.get(`${PREFIX}resident/info`, paramsWithExtraParams(params, this.settings.app.community));
  // 住户管理-根据证件号码查找
  getResidentInfoByCredentialNo = (params: any) => this.http.post(`${PREFIX}resident/getInfoByCredentialNo`, params);
  // 住户管理-审核
  checkResident = (params: any) =>
    this.http.post(`${PREFIX}resident/check`, paramsWithExtraParams(params, this.settings.app.community));

  // 公告管理-列表
  getAnnounceList = (params: any) =>
    this.http.post(`${PREFIX}notice/list`, paramsWithExtraParams(params, this.settings.app.community));
  // 公告管理-删除
  deleteAnnounce = (params: any) => this.http.post(`${PREFIX}notice/delete`, params);
  // 公告管理-新增/修改
  saveAnnounce = (params: any) =>
    this.http.post(`${PREFIX}notice/save`, paramsWithExtraParams(params, this.settings.app.community));
  // 公告管理-详情
  getAnnounceInfo = (id: number) => this.http.get(`${PREFIX}notice/info?id=${id}`);

  // 政务管理-列表
  getPoliticsNewsList = (params: any) =>
    this.http.post(`${PREFIX}politicsNews/list`, paramsWithExtraParams(params, this.settings.app.community));
  // 政务管理-删除
  deletePoliticsNews = (params: any) => this.http.post(`${PREFIX}politicsNews/delete`, params);
  // 政务管理-新增/修改
  savePoliticsNews = (params: any) =>
    this.http.post(`${PREFIX}politicsNews/save`, paramsWithExtraParams(params, this.settings.app.community));
  // 政务管理-详情
  getPoliticsNewsInfo = (id: number) => this.http.get(`${PREFIX}politicsNews/info?id=${id}`);

  // 标签管理-列表
  getTagList = (params: any) =>
    this.http.post(`${PREFIX}articleTag/list`, paramsWithExtraParams(params, this.settings.app.community));
  // 标签管理-删除
  deleteTag = (params: any) => this.http.post(`${PREFIX}articleTag/delete`, params);
  // 标签管理-新增/修改
  saveTag = (params: any) =>
    this.http.post(`${PREFIX}articleTag/save`, paramsWithExtraParams(params, this.settings.app.community));

  // 费用标准-列表
  getFeeStandardList = (params: any) =>
    this.http.post(`${PREFIX}life/fees/standard/list`, paramsWithExtraParams(params, this.settings.app.community));
  // 费用标准-新增/修改
  saveFeeStandard = (params: any) =>
    this.http.post(`${PREFIX}life/fees/standard/save`, paramsWithExtraParams(params, this.settings.app.community));
  // 费用标准-删除
  deleteFeeStandard = (params: any) => this.http.post(`${PREFIX}life/fees/standard/delete`, params);

  // 线下缴费-列表
  getFeeList = (params: any) =>
    this.http.post(`${PREFIX}life/fees/list`, paramsWithExtraParams(params, this.settings.app.community));
  // 线下缴费-详情
  getFeeInfo = (id: number) => this.http.get(`${PREFIX}life/fees/info?id=${id}`);

  // 论坛管理-列表
  getForumList = (params: any) =>
    this.http.post(`${PREFIX}forum/list`, paramsWithExtraParams(params, this.settings.app.community));
  // 论坛管理-删除
  deleteForum = (params: any) => this.http.post(`${PREFIX}forum/delete`, params);
  // 论坛管理-新增/修改
  saveForum = (params: any) =>
    this.http.post(`${PREFIX}forum/save`, paramsWithExtraParams(params, this.settings.app.community));
  // 论坛管理-详情
  getForumInfo = (id: number) => this.http.get(`${PREFIX}forum/info?id=${id}`);

  // 生活小常识-列表
  getSenseList = (params: any) => this.http.post(`${PREFIX}commonSense/list`, params);
  // 生活小常识-新增/修改
  saveSense = (params: any) => this.http.post(`${PREFIX}commonSense/save`, params);
  // 生活小常识-删除
  deleteSense = (params: any) => this.http.post(`${PREFIX}commonSense/delete`, params);

  // 社区活动 - 列表
  getActivityList = (params: any) =>
    this.http.post(`${PREFIX}activity/list`, paramsWithExtraParams(params, this.settings.app.community));
  // 社区活动-删除
  deleteActivity = (params: any) => this.http.post(`${PREFIX}activity/delete`, params);
  // 社区活动-新增/修改
  saveActivity = (params: any) =>
    this.http.post(`${PREFIX}activity/save`, paramsWithExtraParams(params, this.settings.app.community));
  // 社区活动-详情
  getActivityInfo = (id: number) => this.http.get(`${PREFIX}activity/info?id=${id}`);

  // 投票管理 - 列表
  getVoteList = (params: any) =>
    this.http.post(`${PREFIX}vote/list`, paramsWithExtraParams(params, this.settings.app.community));
  // 投票管理-删除
  deleteVote = (params: any) => this.http.post(`${PREFIX}vote/delete`, params);
  // 投票管理-新增/修改
  saveVote = (params: any) =>
    this.http.post(`${PREFIX}vote/save`, paramsWithExtraParams(params, this.settings.app.community));
  // 投票管理-详情
  getVoteInfo = (id: number) => this.http.get(`${PREFIX}vote/info?id=${id}`);
}

function paramsWithExtraParams(params, community) {
  if (community) {
    return { ...params, socialId: community.id, socialIdNeeded: true };
  } else {
    return params;
  }
}

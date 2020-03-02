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

  // 组织架构-成员 - 列表
  getStaffList = (params: any) =>
    this.http.post(`${PREFIX}staff/list`, paramsWithExtraParams(params, this.settings.app.community));
  // 组织架构-成员-删除
  deleteStaff = (params: any) => this.http.post(`${PREFIX}staff/delete`, params);
  // 组织架构-成员-新增/修改
  saveStaff = (params: any) =>
    this.http.post(`${PREFIX}staff/save`, paramsWithExtraParams(params, this.settings.app.community));
  // 组织架构-成员-详情
  getStaffInfo = (id: number) => this.http.get(`${PREFIX}staff/info?id=${id}`);
  // 组织架构管理-列表
  getOrgStructureList = (params: any) =>
    this.http.post(`${PREFIX}orgStructure/list`, paramsWithExtraParams(params, this.settings.app.community));
  // 组织架构管理-删除
  deleteOrgStructure = (params: any) => this.http.get(`${PREFIX}orgStructure/delete`, params);
  // 组织架构管理-新增/修改
  saveOrgStructure = (params: any) =>
    this.http.post(`${PREFIX}orgStructure/save`, paramsWithExtraParams(params, this.settings.app.community));
}

function paramsWithExtraParams(params, community) {
  if (community) {
    return { ...params, socialId: community.id, socialIdNeeded: true };
  } else {
    return params;
  }
}

import { _HttpClient } from '@delon/theme';
import { Injectable } from '@angular/core';

const PREFIX = '/hl/social/';

@Injectable({ providedIn: 'root' })
export class RestService {
  constructor(private http: _HttpClient) {}
  // 登录
  login = (params: any) => this.http.post(`${PREFIX}propertyAccount/login `, params);
  // 退出登录
  logout = () => this.http.get(`${PREFIX}propertyAccount/logout`);
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

  // 人员管理-获取角色列表
  getPersonList = (params: any) => this.http.post(`${PREFIX}operator/list`, params);
  // 人员管理-删除角色
  deletePerson = (params: any) => this.http.post(`${PREFIX}operator/delete`, params);
  // 人员管理-新增或修改角色
  savePerson = (params: any) => this.http.post(`${PREFIX}operator/save`, params);
  // 人员管理-角色详情
  getPersonInfo = (params: any) => this.http.get(`${PREFIX}operator/info`, params);

  // 物业集团公司管理-获取列表
  getEnterpriseList = (params: any) => this.http.post(`${PREFIX}enterpriseGroup/list`, params);
  // 物业集团公司管理-删除
  deleteEnterprise = (params: any) => this.http.post(`${PREFIX}enterpriseGroup/delete`, params);
  // 物业集团公司管理-新增或修改
  saveEnterprise = (params: any) => this.http.post(`${PREFIX}enterpriseGroup/save`, params);
  // 物业集团公司管理-详情
  getEnterpriseInfo = (params: any) => this.http.get(`${PREFIX}enterpriseGroup/info`, params);

  // 物业公司管理-获取列表
  getPropertyCompanyList = (params: any) => this.http.post(`${PREFIX}propertyCompany/list`, params);
  // 物业公司管理-删除
  deletePropertyCompany = (params: any) => this.http.post(`${PREFIX}propertyCompany/delete`, params);
  // 物业公司管理-新增或修改
  savePropertyCompany = (params: any) => this.http.post(`${PREFIX}propertyCompany/save`, params);
  // 物业公司管理-详情
  getPropertyCompanyInfo = (params: any) => this.http.get(`${PREFIX}propertyCompany/info`, params);

  // 物业集团公司账号管理-获取列表
  getEnterpriseAccountList = (params: any) => this.http.post(`${PREFIX}enterpriseAccount/list`, params);
  // 物业集团公司账号管理-删除
  deleteEnterpriseAccount = (params: any) => this.http.post(`${PREFIX}enterpriseAccount/delete`, params);
  // 物业集团公司账号管理-新增或修改
  saveEnterpriseAccount = (params: any) => this.http.post(`${PREFIX}enterpriseAccount/save`, params);
  // 物业集团公司账号管理-详情
  getEnterpriseAccountInfo = (params: any) => this.http.get(`${PREFIX}enterpriseAccount/info`, params);

  // 物业公司账号管理-获取列表
  getPropertyAccountList = (params: any) => this.http.post(`${PREFIX}propertyAccount/list`, params);
  // 物业公司账号管理-删除
  deletePropertyAccount = (params: any) => this.http.post(`${PREFIX}propertyAccount/delete`, params);
  // 物业公司账号管理-新增或修改
  savePropertyAccount = (params: any) => this.http.post(`${PREFIX}propertyAccount/save`, params);
  // 物业公司账号管理-详情
  getPropertyAccountInfo = (params: any) => this.http.get(`${PREFIX}propertyAccount/info`, params);

  // 社区管理-获取列表
  getSocialProjectList = (params: any) => this.http.post(`${PREFIX}social/list`, params);
  // 社区管理-详情
  getSocialProjectInfo = (params: any) => this.http.get(`${PREFIX}social/info`, params);
}

/**
 *
 * @author :
 * @date :
 * @description :
 * @since:
 */
export interface CommunityVo {
  /**
   * 社区id
   */
  id: number;
  /**
   * 社区名称
   */
  name: string;

  /**
   * 社企ID
   */
  socialNo: string;

  /**
   *
   */
  socialNumber: string;
  /**
   *
   */
  province: string;
  /**
   *
   */
  city: string;
  /**
   *
   */
  address: string;
  /**
   * 开发商
   */
  developers: string;
  /**
   * 承建商
   */
  contractor: string;
  /**
   * 物业联系人
   */
  socialContact: string;
  /**
   * 开工日期
   */
  startDate: Date;
  /**
   * 竣工如期
   */
  completionDate: Date;
  /**
   * 总建筑面积
   */
  totalBuildingArea: number;
  /**
   * 道路面积
   */
  roadArea: number;
  /**
   * 总使用面积
   */
  totalUsableArea: number;
  /**
   * 绿化率
   */
  greenRate: number;
  /**
   * 覆盖率
   */
  coverageRate: number;
  /**
   * 公开场所面积
   */
  openSpaceArea: number;
  /**
   * 备注
   */
  remarks: string;
  /**
   *
   */
  dateCreated: Date;
  /**
   * 联系人
   */
  contact: string;
  /**
   *
   */
  lastUpdated: Date;
  /**
   *
   */
  checked?: boolean;

  /**
   * 是否已经填写过支付宝或微信信息
   */
  thirdPayId: string;

  /**
   * 支付宝账号
   */
  aliAccount: string;

  /**
   * 支付宝公钥
   */
  aliPublicKey: string;

  /**
   * 支付宝私钥
   */
  aliPrivateKey: string;

  /**
   * 微信商户id
   */
  weixinPosId: string;

  /**
   * 私钥
   */
  weixinKey: string;

  /**
   * 微信appId
   */
  weixinAccount: string;

  /**
   * 微信appsecret
   */
  weixinAppSecret: string;

  /**
   * 短信验证
   */
  smsCode: string;

  /**
   *
   */
  invoiceUrl: string;

  /**
   * 权限
   */
  socialRoleList: Array<number>;

  policeSocialKey: string;

  images: string;
}

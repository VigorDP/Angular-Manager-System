/*
 * @Description: 菜单配置
 * @Date: 2019-10-19 15:23:19
 * @LastEditors: FYC
 * @Author: FYC
 * @LastEditTime: 2019-10-19 15:23:19
 */

// Support icon by https://ng.ant.design/components/icon/zh

import { Menu } from '@delon/theme';

export const menus: Menu[] = [
  {
    text: '主导航',
    group: true,
    hideInBreadcrumb: true,
    children: [
      {
        text: '系统管理',
        link: '/system',
        icon: 'anticon-home',
        children: [
          {
            text: '账号管理',
            link: '/system/account',
            reuse: false,
          },
          {
            text: '角色管理',
            link: '/system/role',
            reuse: false,
          },
        ],
      },
      {
        text: '社区管理',
        link: '/social',
        icon: 'anticon-folder',
      },
      {
        text: '房屋管理',
        link: '/house',
        icon: 'anticon-apartment',
        children: [
          {
            text: '户室信息',
            link: '/house/usage',
            reuse: false,
          },
          {
            text: '楼栋结构',
            link: '/house/structure',
            reuse: false,
          },
        ],
      },
      {
        text: '住户管理',
        link: '/people',
        icon: 'anticon-user',
      },
      {
        text: '缴费管理',
        link: '/fee',
        icon: 'anticon-money-collect',
        children: [
          {
            text: '线下缴费',
            link: '/fee/offline',
            reuse: false,
          },
          {
            text: '费用标准管理',
            link: '/fee/standard',
            reuse: false,
          },
        ],
      },
    ],
  },
];

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
            text: '人员管理',
            link: '/system/person',
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
        text: '企业管理',
        link: '/enterprise',
        icon: 'anticon-fire',
        children: [
          {
            text: '物业集团公司',
            link: '/enterprise/property-group',
            reuse: false,
          },
          {
            text: '物业公司',
            link: '/enterprise/property',
            reuse: false,
          },
        ],
      },
      {
        text: '企业账号管理',
        link: '/account',
        icon: 'anticon-user',
        children: [
          {
            text: '物业集团公司',
            link: '/account/property-group',
            reuse: false,
          },
          {
            text: '物业公司',
            link: '/account/property',
            reuse: false,
          },
        ],
      },
      {
        text: '社区管理',
        link: '/social',
        icon: 'anticon-folder',
      },
    ],
  },
];

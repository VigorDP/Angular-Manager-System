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
        name: 'DEPT',
        link: '/system',
        icon: 'anticon-home',
        children: [
          {
            text: '账号管理',
            name: 'OPERATOR',
            link: '/system/account',
            reuse: false,
            children: [],
          },
          {
            text: '角色管理',
            name: 'RAM_ROLE',
            link: '/system/role',
            reuse: false,
            children: [],
          },
        ],
      },
      {
        text: '社区管理',
        link: '/social',
        name: 'SOCIAL',
        icon: 'anticon-folder',
        children: [],
      },
      {
        text: '房屋管理',
        link: '/house',
        name: 'HOUSES',
        icon: 'anticon-apartment',
        children: [
          {
            text: '户室信息',
            name: 'ROOM',
            link: '/house/usage',
            reuse: false,
            children: [],
          },
          {
            text: '楼栋结构',
            name: 'BUILDING',
            link: '/house/structure',
            reuse: false,
            children: [],
          },
        ],
      },
      {
        text: '住户管理',
        link: '/people',
        name: 'RESIDENT',
        icon: 'anticon-user',
        children: [],
      },
      {
        text: '缴费管理',
        link: '/fee',
        name: 'PAY',
        icon: 'anticon-money-collect',
        children: [
          {
            text: '线下缴费',
            link: '/fee/offline',
            name: 'OFFLINE_PAY',
            reuse: false,
            children: [],
          },
          {
            text: '费用标准管理',
            name: 'PAY_STANDARD',
            link: '/fee/standard',
            reuse: false,
            children: [],
          },
        ],
      },
      {
        text: '公告管理',
        link: '/announce',
        name: 'NOTICE',
        icon: 'anticon-user',
        children: [
          {
            text: '社区公告',
            link: '/announce/community-announce',
            name: 'COMMUNITY_ANNOUNCE',
            reuse: false,
            children: [],
          },
          {
            text: '警情推送',
            link: '/announce/police-sentiment',
            name: 'POLICE_SENTIMENT',
            reuse: false,
            children: [],
          },
          {
            text: '民情互动',
            link: '/announce/people-sentiment',
            name: 'PEOPLE_SENTIMENT',
            reuse: false,
            children: [],
          },
          {
            text: '社区资讯',
            link: '/announce/community-info',
            name: 'COMMUNITY_INFO',
            reuse: false,
            children: [],
          },
        ],
      },
    ],
  },
];

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
          {
            text: '组织架构',
            name: 'RAM_ROLE',
            link: '/system/architect',
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
        text: '生活缴费',
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
        icon: 'anticon-notification',
        children: [],
      },
      {
        text: '政务管理',
        link: '/government',
        name: 'POLITICS_NEWS',
        icon: 'anticon-safety',
        children: [],
      },
      {
        text: '其他',
        link: '/other',
        name: 'OTHER',
        icon: 'anticon-gold',
        children: [
          {
            text: '社区活动',
            link: '/other/activity',
            name: 'ACTIVITY',
            reuse: false,
            children: [],
          },
          {
            text: '投票管理',
            link: '/other/vote',
            name: 'VOTE',
            reuse: false,
            children: [],
          },
          {
            text: '论坛管理',
            name: 'FORUM',
            link: '/other/forum',
            reuse: false,
            children: [],
          },
          {
            text: '生活小常识',
            name: 'COMMON_SENSE',
            link: '/other/sense',
            reuse: false,
            children: [],
          },
          {
            text: '快递',
            name: 'EXPRESS',
            link: '/other/express',
            reuse: false,
            children: [],
          },
        ],
      },
    ],
  },
];

import { STData, STPage } from '@delon/abc';

export * from './community';
// 页面配置相关
export const query: any = {
  pageNo: 1,
  pageSize: 10,
};

export const defaultQuery = { ...query };

export const pages: STPage = {
  total: '',
  show: true, // 显示分页
  front: false, // 关闭前端分页，true是前端分页，false后端控制分页
  showSize: true,
  showQuickJumper: true,
};

export let total = 0;

export let loading = false;

export let data: STData[] = [];

export let selectedRows: STData[] = [];

export let selectedRow: STData = {};

// 审核
export const AllowList: any = [
  {
    label: true,
    value: '通过',
  },
  {
    label: false,
    value: '不通过',
  },
];
// 性别
export const SexList: any = [
  {
    label: '男',
    value: 'MALE',
  },
  {
    label: '女',
    value: 'FEMALE',
  },
];

export interface PageResult<T> {
  total: number;
  totalPage: number;
  pageSize: number;
  pageNo: number;
  rows: Array<T>;
}

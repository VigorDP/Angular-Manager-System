import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SettingsService } from '@delon/theme';
import { STChange, STColumn, STComponent } from '@delon/abc';
import { RestService } from '@app/service';
import { data, defaultQuery, loading, pages, query, selectedRow, selectedRows, total } from '@app/common';
import { cloneDeep } from 'lodash';

@Component({
  templateUrl: './index.component.html',
  styleUrls: [`./index.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumComponent implements OnInit, OnDestroy {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '发布人', index: 'userName' },
    { title: '发布时间', index: 'postTime' },
    { title: '内容', index: 'content' },
    { title: '图片数量', index: 'imagesCount' },
    {
      title: '评论数',
      index: 'commentCount',
      type: 'link',
      click: item => {
        this.userList.selectedRow = item;
        this.viewUserList(this.userListContent, 'comment');
      },
    },
    {
      title: '点赞数',
      index: 'thumbUpCount',
      type: 'link',
      click: item => {
        this.userList.selectedRow = item;
        this.viewUserList(this.userListContent, 'thumbUp');
      },
    },
    {
      title: '收藏数',
      index: 'collectCount',
      type: 'link',
      click: item => {
        this.userList.selectedRow = item;
        this.viewUserList(this.userListContent, 'collect');
      },
    },
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      buttons: [
        {
          text: '查看',
          icon: 'eye',
          click: (item: any) => {
            this.selectedRow = item;
            this.addOrEditOrView(this.viewTpl, 'view');
          },
        },
        {
          text: '删除',
          icon: 'delete',
          click: (item: any) => {
            this.selectedRow = item;
            this.delete();
          },
        },
      ],
    },
  ];

  @ViewChild('st', { static: true })
  st: STComponent;
  @ViewChild('userSt', { static: true })
  userSt: STComponent;
  @ViewChild('viewContent', { static: true })
  viewTpl: TemplateRef<any>;
  @ViewChild('userListContent', { static: true })
  userListContent: TemplateRef<any>;

  userList = {
    query: cloneDeep(query),
    pages: cloneDeep(pages),
    total,
    loading,
    data: cloneDeep(data),
    selectedRow: cloneDeep(selectedRow),
    columns: [
      { title: '', index: 'image', type: 'img' },
      { title: '姓名', index: 'userName' },
      { title: '地址', index: 'address' },
    ],
  };

  countTypeList = [{ value: 1, label: '评论数' }, { value: 2, label: '点赞数' }, { value: 3, label: '收藏数' }];

  compareTypeList = [{ value: 1, label: '大于' }, { value: 0, label: '小于' }];

  image = ''; // 小区效果图
  dateRange = null;
  sub = null;
  constructor(
    public api: RestService,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private settings: SettingsService,
  ) {}

  ngOnInit() {
    this.query = { ...defaultQuery };
    if (this.settings.app.community) {
      this.getData();
    }
    this.sub = this.settings.notify.subscribe(() => {
      this.getData();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getData(pageIndex?: number) {
    this.loading = true;
    this.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getForumList(this.query).subscribe(res => {
      this.loading = false;
      const { rows, total: totalItem } = res.data || { rows: [], total: 0 };
      this.data = rows;
      this.total = totalItem;
      this.pages = {
        ...this.pages,
        total: `共 ${totalItem} 条记录`,
      };
      this.cdr.detectChanges();
    });
  }

  stChange(e: STChange) {
    switch (e.type) {
      case 'checkbox':
        this.selectedRows = e.checkbox!;
        this.cdr.detectChanges();
        break;
      case 'filter':
        this.getData(e.pi);
        break;
      case 'pi':
        this.getData(e.pi);
        break;
      case 'ps':
        this.query.pageSize = e.ps;
        this.getData(e.pi);
        break;
    }
  }

  reset() {
    this.query = { ...defaultQuery };
    this.loading = true;
    setTimeout(() => this.getData(1));
  }

  addOrEditOrView(tpl: TemplateRef<{}>, type: 'add' | 'edit' | 'view') {
    const modal = this.modalSrv.create({
      nzTitle: '帖子内容',
      nzContent: tpl,
      nzOkDisabled: type === 'view',
      nzWidth: 800,
      nzOnOk: () => {},
    });
    modal.afterOpen.subscribe(() => {
      if (type === 'edit' || type === 'view') {
        this.api.getForumInfo(this.selectedRow.id).subscribe(res => {
          if (res.code === '0') {
            this.selectedRow = { ...this.selectedRow, ...res.data };
          }
        });
      }
    });
  }

  delete() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deleteForum(this.selectedRow.id).subscribe(() => {
          this.getData();
        });
      },
    });
  }

  // batchDelete() {
  //   if (!this.selectedRows.length) {
  //     this.msg.info('请选择删除项');
  //     return false;
  //   }
  //   const ids = this.selectedRows.map(item => item.id);
  //   this.modalSrv.confirm({
  //     nzTitle: '是否确定删除选中项？',
  //     nzOkType: 'danger',
  //     nzOnOk: () => {
  //       this.api.deletePoliticsNews(ids).subscribe(() => {
  //         this.getData();
  //         this.st.clearCheck();
  //       });
  //     },
  //   });
  // }

  viewUserList(tpl: TemplateRef<{}>, type: string) {
    this.userList.query = {
      ...this.userList.query,
      postId: this.userList.selectedRow.id,
      type,
    };
    const modal = this.modalSrv.create({
      nzTitle: type === 'comment' ? '评论用户' : type === 'thumbUp' ? '点赞用户' : '收藏用户',
      nzContent: tpl,
      nzOkDisabled: true,
      nzWidth: 600,
      nzOnOk: () => {},
    });
    modal.afterOpen.subscribe(() => {
      this.getUserListData(1);
    });
  }

  getUserListData(pageIndex?: number) {
    this.userList.loading = true;
    this.userList.query.pageNo = pageIndex ? pageIndex : this.userList.query.pageNo;
    this.api.getForumUserList(this.userList.query).subscribe(res => {
      this.userList.loading = false;
      const { rows, total: totalItem } = res.data || { rows: [], total: 0 };
      this.userList.data = rows;
      this.userList.total = totalItem;
      this.userList.pages = {
        ...this.userList.pages,
        total: `共 ${totalItem} 条记录`,
      };
      this.cdr.detectChanges();
    });
  }

  userStChange(e: STChange) {
    switch (e.type) {
      case 'filter':
        this.getUserListData(e.pi);
        break;
      case 'pi':
        this.getUserListData(e.pi);
        break;
      case 'ps':
        this.userList.query.pageSize = e.ps;
        this.getUserListData(e.pi);
        break;
    }
  }
}

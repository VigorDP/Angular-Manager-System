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
import * as dayjs from 'dayjs';

@Component({
  templateUrl: './index.component.html',
  styleUrls: [`./index.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityComponent implements OnInit, OnDestroy {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '标题', index: 'title' },
    { title: '发布人', index: 'creator' },
    { title: '所属标签', index: 'tag' },
    { title: '状态', index: 'status', format: item => this.statusList.filter(i => i.value === item.status)[0].label },
    { title: '参与人数', index: 'count' },
    { title: '发布时间', index: 'gmtCreate' },
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
  showTagManager = false;
  tagList = [];
  statusList = [{ value: 0, label: '未开始' }, { value: 1, label: '进行中' }, { value: 2, label: '已结束' }];

  @ViewChild('st', { static: true })
  st: STComponent;
  @ViewChild('modalContent', { static: true })
  tpl: TemplateRef<any>;
  @ViewChild('viewContent', { static: true })
  viewTpl: TemplateRef<any>;
  @ViewChild('content', { static: false })
  content: ElementRef;

  image = ''; // 小区效果图
  dateRange = null;
  dateRange1 = null;
  sub = null;
  constructor(
    public api: RestService,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private settings: SettingsService,
  ) {}

  ngOnInit() {
    this.query = { ...defaultQuery, cate: 'SOCIAL_ACTIVITY' };
    if (this.settings.app.community) {
      this.getData();
      this.getTagData();
    }
    this.sub = this.settings.notify.subscribe(() => {
      this.getData();
      this.getTagData();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  dateRangeChange() {
    let startDate = null;
    let endDate = null;
    if (this.dateRange) {
      startDate = `${dayjs(this.dateRange[0]).format('YYYY-MM-DD')} 00:00:00`;
      endDate = `${dayjs(this.dateRange[1]).format('YYYY-MM-DD')} 23:59:59`;
    }
    this.query = {
      ...this.query,
      startDate,
      endDate,
    };
  }

  getData(pageIndex?: number) {
    this.loading = true;
    this.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getActivityList(this.query).subscribe(res => {
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
    this.query = { ...defaultQuery, cate: 'SOCIAL_ACTIVITY' };
    this.loading = true;
    setTimeout(() => this.getData(1));
  }

  addOrEditOrView(tpl: TemplateRef<{}>, type: 'add' | 'edit' | 'view') {
    const modal = this.modalSrv.create({
      nzTitle: type === 'add' ? '新建活动' : type === 'edit' ? '编辑活动' : '查看活动',
      nzContent: tpl,
      nzOkDisabled: type === 'view',
      nzWidth: 800,
      nzOnOk: () => {
        if (this.checkValid()) {
          return new Promise(resolve => {
            this.api
              .saveActivity({
                ...this.selectedRow,
              })
              .subscribe(res => {
                if (res.code === '0') {
                  resolve();
                  this.getData();
                } else {
                  resolve(false);
                }
              });
          });
        } else {
          return false;
        }
      },
    });
    modal.afterOpen.subscribe(() => {
      if (type === 'edit' || type === 'view') {
        this.api.getActivityInfo(this.selectedRow.id).subscribe(res => {
          if (res.code === '0') {
            this.selectedRow = { ...this.selectedRow, ...res.data };
            if (type === 'view') {
              this.content.nativeElement.innerHTML = this.selectedRow.content;
            }
          }
        });
      }
    });
  }

  checkValid() {
    const { title, descr, content, tag } = this.selectedRow;
    if (!title) {
      this.msg.info('请输入活动标题');
      return false;
    }
    // if (!this.image) {
    //   this.msg.info('请上传标题图片');
    //   return false;
    // }
    if (!tag) {
      this.msg.info('请选择标签');
      return false;
    }
    if (!descr) {
      this.msg.info('情输入活动概述');
      return false;
    }
    if (!this.dateRange1) {
      this.msg.info('请选择活动起始时间');
      return false;
    }
    this.selectedRow.startDate = `${dayjs(this.dateRange1[0]).format('YYYY-MM-DD HH:mm:ss')}`;
    this.selectedRow.endDate = `${dayjs(this.dateRange1[1]).format('YYYY-MM-DD HH:mm:ss')}`;
    if (!content) {
      this.msg.info('请输入活动内容');
      return false;
    }
    return true;
  }

  getImgUrl(e) {
    this.image = e[0];
  }

  delete() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deleteActivity([this.selectedRow.id]).subscribe(() => {
          this.getData();
        });
      },
    });
  }

  batchDelete() {
    if (!this.selectedRows.length) {
      this.msg.info('请选择删除项');
      return false;
    }
    const ids = this.selectedRows.map(item => item.id);
    this.modalSrv.confirm({
      nzTitle: '是否确定删除选中项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deleteActivity(ids).subscribe(() => {
          this.getData();
          this.st.clearCheck();
        });
      },
    });
  }

  getTagData() {
    this.api.getTagList({ cate: this.query.cate }).subscribe(res => {
      this.tagList = res.data || [];
      this.cdr.detectChanges();
    });
  }
}

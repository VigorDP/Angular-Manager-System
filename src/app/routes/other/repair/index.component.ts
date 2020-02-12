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
export class RepairComponent implements OnInit, OnDestroy {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '报修单号', index: 'orderNo' },
    { title: '报修人姓名', index: 'name' },
    { title: '报修类别', index: 'type' },
    { title: '处理状态', index: 'status' },
    { title: '处理人', index: 'assignee' },
    { title: '提交时间', index: 'time' },
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

  typeList = [
    { label: '个人报修', value: 'person' },
    { label: '公共报修', value: 'public' },
  ];
  size = [1, 2, 3, 4, 5];
  viewData = cloneDeep(data);
  viewColumns: STColumn[] = [
    { title: '报修类型', index: 'type' },
    { title: '报修类别', index: 'device' },
    { title: '联系电话', index: 'tel' },
    { title: '报修地址', index: 'address' },
  ];

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
    this.api.getRepairList(this.query).subscribe(res => {
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
        this.api.getRepairInfo(this.selectedRow.id).subscribe(res => {
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
        this.api.deleteRepair(this.selectedRow.id).subscribe(() => {
          this.getData();
        });
      },
    });
  }

  handlePreviewImg(src) {}
}

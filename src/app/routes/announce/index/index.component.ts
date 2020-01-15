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
import * as dayjs from 'dayjs';

@Component({
  templateUrl: './index.component.html',
  styleUrls: [`./index.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnounceComponent implements OnInit, OnDestroy {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    { title: '公告标题', index: 'title' },
    { title: '发布人', index: 'creator' },
    { title: '所属标签', index: 'tag' },
    {
      title: '是否置顶',
      index: 'isTop',
      format: (value, col, index) => {
        return value.isTop ? '是' : '否';
      },
    },
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
          text: '编辑',
          icon: 'edit',
          click: (item: any) => {
            this.selectedRow = item;
            this.addOrEditOrView(this.tpl, 'edit');
          },
        },
        {
          text: '设为置顶',
          icon: 'upload',
          iif: item => !item.isTop,
          iifBehavior: 'hide',
          click: (item: any) => {
            this.selectedRow = item;
            this.dateRange = null;
            this.gotoTop();
          },
        },
        {
          text: '取消置顶',
          icon: 'download',
          iif: item => item.isTop,
          iifBehavior: 'hide',
          click: (item: any) => {
            this.selectedRow = item;
            this.cancelTop();
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
  @ViewChild('st', { static: true })
  st: STComponent;
  @ViewChild('topContent', { static: true })
  top: TemplateRef<any>;
  @ViewChild('modalContent', { static: true })
  tpl: TemplateRef<any>;
  @ViewChild('viewContent', { static: true })
  viewTpl: TemplateRef<any>;
  @ViewChild('content', { static: false })
  content: ElementRef;

  noticeCateList = [
    {
      value: 'SOCIAL_NOTICE',
      label: '社区公告',
    },
    {
      value: 'POLICE',
      label: '警情推送',
    },
    {
      value: 'CITIZEN',
      label: '民情互动',
    },
    {
      value: 'INFORMATION',
      label: '社区资讯',
    },
  ];
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
    this.query = { ...defaultQuery, cate: 'SOCIAL_NOTICE' };
    if (this.settings.app.community) {
      this.getData();
      this.getTagData();
    }
    this.sub = this.settings.notify.subscribe(res => {
      this.getData();
      this.getTagData();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getData(pageIndex?: number) {
    this.loading = true;
    this.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getAnnounceList(this.query).subscribe(res => {
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
    this.query = { ...defaultQuery, cate: 'SOCIAL_NOTICE' };
    this.loading = true;
    setTimeout(() => this.getData(1));
  }

  selectCate() {
    this.getData(1);
  }

  addOrEditOrView(tpl: TemplateRef<{}>, type: 'add' | 'edit' | 'view') {
    const modal = this.modalSrv.create({
      nzTitle: type === 'add' ? '新建公告' : type === 'edit' ? '编辑公告' : '查看公告',
      nzContent: tpl,
      nzOkDisabled: type === 'view',
      nzWidth: 800,
      nzOnOk: () => {
        if (this.checkValid()) {
          return new Promise(resolve => {
            this.api
              .saveAnnounce({
                ...this.selectedRow,
                cate: this.query.cate,
                image: this.image,
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
    modal.afterOpen.subscribe(res => {
      if (type === 'edit' || type === 'view') {
        this.api.getAnnounceInfo(this.selectedRow.id).subscribe(res => {
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
    const { title, descr, content, image, isPush, tag, type, isTop } = this.selectedRow;
    if (!title) {
      this.msg.info('请输入公告标题');
      return false;
    }
    if (!tag) {
      this.msg.info('请选择标签');
      return false;
    }
    if (!descr) {
      this.msg.info('请输入文章概述');
      return false;
    }
    if (isTop) {
      if (!this.dateRange) {
        this.msg.info('请选择置顶开始、置顶结束时间');
        return false;
      }
      this.selectedRow.pinStart = `${dayjs(this.dateRange[0]).format('YYYY-MM-DD')} 00:00:00`;
      this.selectedRow.pinEnd = `${dayjs(this.dateRange[1]).format('YYYY-MM-DD')} 23:59:59`;
    }
    if (!content) {
      this.msg.info('请输入文章内容');
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
        this.api.deleteAnnounce([this.selectedRow.id]).subscribe(() => {
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
        this.api.deleteAnnounce(ids).subscribe(() => {
          this.getData();
          this.st.clearCheck();
        });
      },
    });
  }

  gotoTop() {
    const modal = this.modalSrv.create({
      nzTitle: '选择置顶时间',
      nzContent: this.top,
      nzWidth: 800,
      nzOnOk: () => {
        if (!this.dateRange) {
          this.msg.info('请选择置顶时间');
          return false;
        }
        this.selectedRow.pinStart = `${dayjs(this.dateRange[0]).format('YYYY-MM-DD')} 00:00:00`;
        this.selectedRow.pinEnd = `${dayjs(this.dateRange[1]).format('YYYY-MM-DD')} 23:59:59`;
        return new Promise(resolve => {
          this.api
            .saveAnnounce({
              ...this.selectedRow,
              isTop: true,
              cate: this.query.cate,
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
      },
    });
    modal.afterOpen.subscribe(res => {
      this.api.getAnnounceInfo(this.selectedRow.id).subscribe(res => {
        if (res.code === '0') {
          this.selectedRow = { ...this.selectedRow, ...res.data };
        }
      });
    });
  }

  cancelTop() {
    this.api.getAnnounceInfo(this.selectedRow.id).subscribe(res => {
      if (res.code === '0') {
        this.selectedRow = {
          ...this.selectedRow,
          ...res.data,
          isTop: false,
          pinStart: null,
          pinEnd: null,
          cate: this.query.cate,
        };
        this.modalSrv.confirm({
          nzTitle: '是否确定取消置顶？',
          nzOkType: 'danger',
          nzOnOk: () => {
            this.api.saveAnnounce(this.selectedRow).subscribe(() => {
              this.getData();
            });
          },
        });
      }
    });
  }

  getTagData() {
    this.api.getTagList({ cate: this.query.cate }).subscribe(res => {
      this.tagList = res.data || [];
      this.cdr.detectChanges();
    });
  }
}

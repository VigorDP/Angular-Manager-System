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
import {
  data,
  defaultQuery,
  loading,
  pages,
  query,
  selectedRow,
  selectedRows,
  total,
  GenderList,
  StudyList,
  CardList,
  ProvinceList,
  getCityOrAreaListByCode,
} from '@app/common';
import * as dayjs from 'dayjs';

@Component({
  templateUrl: './index.component.html',
  styles: [
    `
      input {
        width: 150px;
      }
      nz-select {
        width: 150px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchitectComponent implements OnInit, OnDestroy {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '姓名', index: 'name' },
    { title: '职位', index: 'position' },
    { title: '手机号', index: 'tel' },
    { title: '邮箱', index: 'email' },
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      buttons: [
        {
          text: '编辑',
          icon: 'edit',
          click: (item: any) => {
            this.selectedRow = item;
            this.addOrEditOrView(this.tpl, 'edit');
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
  genderList = GenderList;
  studyList = StudyList;
  cardList = CardList;
  provinceList = ProvinceList;
  cityList = [];
  areaList = [];
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
    this.query = { ...defaultQuery, noticeCate: 'SOCIAL_NOTICE' };
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
    this.query = { ...defaultQuery, noticeCate: 'SOCIAL_NOTICE' };
    this.loading = true;
    setTimeout(() => this.getData(1));
  }

  selectCate() {
    this.getData(1);
  }

  addOrEditOrView(tpl: TemplateRef<{}>, type: 'add' | 'edit' | 'view') {
    const modal = this.modalSrv.create({
      nzTitle: type === 'add' ? '新建成员' : type === 'edit' ? '编辑成员' : '查看成员',
      nzContent: tpl,
      nzOkDisabled: type === 'view',
      nzWidth: 800,
      nzOnOk: () => {
        if (this.checkValid()) {
          return new Promise(resolve => {
            this.api
              .saveAnnounce({
                ...this.selectedRow,
                noticeCate: this.query.noticeCate,
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
      this.msg.info('请输入成员标题');
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
              noticeCate: this.query.noticeCate,
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

  getTagData() {
    this.api.getTagList({ noticeCate: this.query.noticeCate }).subscribe(res => {
      this.tagList = res.data || [];
      this.cdr.detectChanges();
    });
  }

  handleProvinceSelected(e) {
    this.cityList = getCityOrAreaListByCode(e);
  }

  handleCitySelected(e) {
    this.areaList = getCityOrAreaListByCode(this.query.provinceCode || this.selectedRow.provinceCode, e);
  }
}

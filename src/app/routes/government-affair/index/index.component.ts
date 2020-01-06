import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GovernmentAffairComponent implements OnInit {
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

  @ViewChild('st', { static: true })
  st: STComponent;
  @ViewChild('modalContent', { static: true })
  tpl: TemplateRef<any>;
  @ViewChild('viewContent', { static: true })
  viewTpl: TemplateRef<any>;
  @ViewChild('content', { static: false })
  content: ElementRef;

  noticeCateList = [
    {
      value: 'INNER_PARTY_PUBLICITY',
      label: '党建要闻',
    },
    {
      value: 'PARTY_BUILDING_NEWS',
      label: '党内公示',
    },
    {
      value: 'PARTY_MEMBER_ACTIVITY',
      label: '学习党章',
    },
    {
      value: 'TELL_THE_PARTY',
      label: '听党指挥',
    },
  ];
  image = ''; // 小区效果图
  dateRange = null;

  /*标签管理*/
  tagObject = {
    query: cloneDeep(query),
    pages: cloneDeep(pages),
    total,
    loading,
    data: cloneDeep(data),
    selectedRow: cloneDeep(selectedRow),
    copy: cloneDeep(selectedRow),
    columns: [
      { title: '标签', index: 'name' },
      {
        title: '操作',
        buttons: [
          {
            text: '编辑',
            icon: 'edit',
            click: (item: any) => {
              this.tagObject.selectedRow = item;
              this.tagObject.copy = cloneDeep(item);
              this.addOrEditTag(this.tagTpl, 'edit');
            },
          },
          {
            text: '删除',
            icon: 'delete',
            click: (item: any) => {
              this.tagObject.selectedRow = item;
              this.deleteTag();
            },
          },
        ],
      },
    ],
  };
  @ViewChild('tagSt', { static: true })
  tagSt: STComponent;
  @ViewChild('tagModalContent', { static: true })
  tagTpl: TemplateRef<any>;

  constructor(
    private api: RestService,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private settings: SettingsService,
  ) {
  }

  ngOnInit() {
    this.query = { ...defaultQuery, noticeCate: 'INNER_PARTY_PUBLICITY' };
    if (this.settings.app.community) {
      this.getData();
    }
    this.settings.notify.subscribe(res => {
      this.getData();
    });
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
    this.query = { ...defaultQuery, noticeCate: 'INNER_PARTY_PUBLICITY' };
    this.loading = true;
    setTimeout(() => this.getData(1));
  }

  selectCate() {
    this.getData(1);
  }

  addOrEditOrView(tpl: TemplateRef<{}>, type: 'add' | 'edit' | 'view') {
    const modal = this.modalSrv.create({
      nzTitle: type === 'add' ? '新建文章' : type === 'edit' ? '编辑文章' : '查看文章',
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
    const { title, descr, content, image, isPush, tag, type, top } = this.selectedRow;
    if (!title) {
      this.msg.info('请输入文章标题');
      return false;
    }
    if (!tag) {
      this.msg.info('请选择标签');
      return false;
    }
    if (!descr) {
      this.msg.info('情输入文章概述');
      return false;
    }
    if (top) {
      if (!this.dateRange) {
        this.msg.info('请选择置顶开始、置顶结束时间');
        return false;
      }
      this.selectedRow.pinStart = `${dayjs(this.dateRange[0]).format('YYYY-MM-DD')} 00:00:00`;
      this.selectedRow.pinEnd = `${dayjs(this.dateRange[1]).format('YYYY-MM-DD')} 23:59:59`;
    }
    /*if (!type) {
      this.msg.info('请选择公告类型');
      return false;
    }*/
    if (!content) {
      this.msg.info('请输入文章内容');
      return false;
    }
    return true;
  }

  getImgUrl(e) {
    this.image = e;
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

  cancelTop() {
    this.modalSrv.confirm({
      nzTitle: '是否确定取消置顶？',
      nzOkType: 'danger',
      nzOnOk: () => {
        /*this.api.deleteSocialProject([this.selectedRow.id]).subscribe(() => {
          this.getData();
          this.settings.setApp({
            ...this.settings.app,
            event: 'SOCIAL_CHANGED',
            targetId: this.selectedRow.id,
          });
          this.st.clearCheck();
        });*/
      },
    });
  }

  onRangeChange(e) {
    console.log('e', e);
  }

  htmlChange(e) {
    console.log('html', e);
  }

  tagManager(tpl: TemplateRef<{}>) {
    this.getTagData();
    this.modalSrv.create({
      nzTitle: '标签管理',
      nzContent: tpl,
      nzWidth: 800,
      nzFooter: null,
    });
  }

  getTagData(pageIndex?: number) {
    this.tagObject.loading = true;
    this.tagObject.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getTagList({ noticeCate: this.query.noticeCate }).subscribe(res => {
      this.tagObject.loading = false;
      this.tagObject.data = res.data || [];
      this.cdr.detectChanges();
    });
  }

  tagStChange(e: STChange) {
    switch (e.type) {
      case 'filter':
        this.getTagData(e.pi);
        break;
      case 'pi':
        this.getTagData(e.pi);
        break;
      case 'ps':
        this.tagObject.query.pageSize = e.ps;
        this.getTagData(e.pi);
        break;
    }
  }

  addOrEditTag(tpl: TemplateRef<{}>, type: 'add' | 'edit') {
    this.modalSrv.create({
      nzTitle: type === 'add' ? '新增标签' : '编辑标签',
      nzContent: tpl,
      nzWidth: 400,
      nzOnOk: () => {
        if (this.checkTagValid()) {
          return new Promise(resolve => {
            this.api
              .saveTag({
                ...this.tagObject.selectedRow,
                agoName: this.tagObject.copy.name,
                noticeCate: this.query.noticeCate,
              })
              .subscribe(res => {
                if (res.code === '0') {
                  resolve();
                  this.getTagData();
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
  }

  checkTagValid() {
    const { name } = this.tagObject.selectedRow;
    if (!name) {
      this.msg.info('请输入标签名称');
      return false;
    }
    return true;
  }

  deleteTag() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deleteTag(this.tagObject.selectedRow).subscribe(() => {
          this.getData();
          this.tagSt.clearCheck();
        });
      },
    });
  }
}

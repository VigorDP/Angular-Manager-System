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

@Component({
  templateUrl: './index.component.html',
  styles: [
    `
      input {
        width: 120px;
      }
      nz-select {
        width: 100px;
      }
    `,
  ],
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
    { title: '发布人', index: 'creator' },
    { title: '发布时间', index: 'gmtCreate' },
    { title: '内容', index: 'tag' },
    { title: '图片数量', index: 'tag' },
    { title: '评论数', index: 'tag' },
    { title: '点赞数', index: 'tag' },
    { title: '收藏数', index: 'tag' },
    { title: '被举报', index: 'tag' },
    { title: '被屏蔽', index: 'tag' },
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
  sub = null;
  constructor(
    public api: RestService,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private settings: SettingsService,
  ) {}

  ngOnInit() {
    this.query = { ...defaultQuery, type: '1', operator: '1', number: 0 };
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
    this.api.getPoliticsNewsList(this.query).subscribe(res => {
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
    this.query = { ...defaultQuery, cate: 'PARTY_NEWS' };
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
              .savePoliticsNews({
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
    modal.afterOpen.subscribe(() => {
      if (type === 'edit' || type === 'view') {
        this.api.getPoliticsNewsInfo(this.selectedRow.id).subscribe(res => {
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
        this.api.deletePoliticsNews([this.selectedRow.id]).subscribe(() => {
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
        this.api.deletePoliticsNews(ids).subscribe(() => {
          this.getData();
          this.st.clearCheck();
        });
      },
    });
  }

  getTagData() {
    this.api.getTagList({ noticeCate: this.query.cate }).subscribe(res => {
      this.tagList = res.data || [];
      this.cdr.detectChanges();
    });
  }
}

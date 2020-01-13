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

const OPTION: any = { id: null, descr: '' };

@Component({
  templateUrl: './index.component.html',
  styleUrls: [`./index.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoteComponent implements OnInit {
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
    { title: '发布时间', index: 'gmtCreate' },
    { title: '状态', index: 'status', format: item => this.statusList.filter(i => i.value === item.status)[0].label },
    { title: '投票人数', index: 'count' },
    { title: '开始时间', index: 'startDate' },
    { title: '结束时间', index: 'endDate' },

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
  voteTotal = 0;

  viewData = cloneDeep(data);
  viewColumns: STColumn[] = [
    { title: '发起人', index: 'creator' },
    { title: '发布时间', index: 'gmtCreate' },
    { title: '状态', index: 'status', format: item => this.statusList.filter(i => i.value === item.status)[0].label },
    { title: '开始时间', index: 'startDate' },
    { title: '结束时间', index: 'endDate' },
  ];

  @ViewChild('st', { static: true })
  st: STComponent;
  @ViewChild('modalContent', { static: true })
  tpl: TemplateRef<any>;
  @ViewChild('viewContent', { static: true })
  viewTpl: TemplateRef<any>;
  @ViewChild('content', { static: false })
  content: ElementRef;

  image = '';
  dateRange = null;

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
    this.settings.notify.subscribe(() => {
      this.getData();
    });
  }

  getData(pageIndex?: number) {
    this.loading = true;
    this.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getVoteList(this.query).subscribe(res => {
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

  selectCate() {
    this.getData(1);
  }

  addOrEditOrView(tpl: TemplateRef<{}>, type: 'add' | 'edit' | 'view') {
    if (type === 'add') {
      this.selectedRow.dtos = [cloneDeep(OPTION), cloneDeep(OPTION)];
    }
    const modal = this.modalSrv.create({
      nzTitle: type === 'add' ? '新建投票' : type === 'edit' ? '编辑投票' : '查看投票',
      nzContent: tpl,
      nzOkDisabled: type === 'view',
      nzWidth: 1200,
      nzOnOk: () => {
        if (this.checkValid()) {
          return new Promise(resolve => {
            this.api
              .saveVote({
                ...this.selectedRow,
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
        this.api.getVoteInfo(this.selectedRow.id).subscribe(res => {
          if (res.code === '0') {
            this.selectedRow = { ...this.selectedRow, ...res.data };
            this.voteTotal = this.selectedRow.dtos.reduce((pre, cur) => pre + cur.count, 0);
            this.viewData = [this.selectedRow];
          }
        });
      }
    });
  }

  checkValid() {
    const { title, descr, dtos } = this.selectedRow;
    if (!title) {
      this.msg.info('请输入投票标题');
      return false;
    }
    if (!descr) {
      this.msg.info('情输入投票内容描述');
      return false;
    }
    if (!this.dateRange) {
      this.msg.info('请选择投票开始结束时间');
      return false;
    }
    this.selectedRow.startDate = dayjs(this.dateRange[0]).format('YYYY-MM-DD HH:mm:ss');
    this.selectedRow.endDate = dayjs(this.dateRange[1]).format('YYYY-MM-DD HH:mm:ss');
    const emptys = dtos.filter(opt => !opt.descr || !opt.descr.length);
    if (emptys && emptys.length) {
      this.msg.info('投票选项不能为空');
      return false;
    }
    dtos.forEach((i, idx) => {
      i.id = idx + 1;
    });
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
        this.api.deleteVote([this.selectedRow.id]).subscribe(() => {
          this.getData();
        });
      },
    });
  }

  addOptions() {
    if (this.selectedRow.dtos && this.selectedRow.dtos.length === 10) {
      return;
    }
    this.selectedRow.dtos.push(cloneDeep(OPTION));
    console.log(this.selectedRow.dtos);
  }

  removeOptions(idx) {
    this.selectedRow.dtos.splice(idx, 1);
  }
}

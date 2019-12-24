import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { NzMessageService, NzModalService, NzFormatEmitEvent } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { STComponent, STChange, STColumn } from '@delon/abc';
import { RestService } from '@app/service';
import { query, defaultQuery, pages, total, loading, data, selectedRows, selectedRow } from '@app/common';

@Component({
  templateUrl: './index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleComponent implements OnInit, OnDestroy {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  userRightTree = [];
  moduleIds = [];
  columns: STColumn[] = [
    { title: '角色名称', index: 'name' },
    { title: '创建时间', index: 'gmtCreate' },
    {
      title: '操作',
      fixed: 'right',
      width: 400,
      buttons: [
        {
          text: '编辑',
          icon: 'edit',
          iif: item => item.value !== 'SUPER_ADMIN' && item.value !== 'ADMIN',
          iifBehavior: 'hide',
          click: (item: any) => {
            this.selectedRow = item;
            this.addOrEditOrView(this.tpl, 'edit');
          },
        },
        {
          text: '删除',
          icon: 'delete',
          iif: item => item.value !== 'SUPER_ADMIN' && item.value !== 'ADMIN',
          iifBehavior: 'hide',
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

  constructor(
    private api: RestService,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.getData();
    this.getUserRightList();
  }

  ngOnDestroy() {
    this.moduleIds = [];
  }

  getData(pageIndex?: number) {
    this.loading = true;
    this.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getRoleList(this.query).subscribe(res => {
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

  getUserRightList() {
    this.api.getUserRightList().subscribe(res => {
      if (res.code === '0') {
        this.userRightTree = this.transformTree(res.data);
      }
    });
  }

  transformTree(nodes) {
    return nodes.map(node => ({
      title: node.descr,
      key: node.id,
      children: node.childList ? this.transformTree(node.childList) : null,
    }));
  }

  delete() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deleteRole([this.selectedRow.id]).subscribe(() => {
          this.getData();
          this.st.clearCheck();
        });
      },
    });
  }

  addOrEditOrView(tpl: TemplateRef<{}>, type: 'add' | 'edit' | 'view') {
    if (type === 'edit') {
      this.api.getRoleInfo({ id: this.selectedRow.id }).subscribe(res => {
        if (res.code === '0') {
          this.selectedRow = { ...this.selectedRow, ...res.data };
          this.moduleIds = res.data.modules.map(module => module.id);
        }
      });
    }
    this.modalSrv.create({
      nzTitle: type === 'add' ? '新增角色' : '编辑角色',
      nzContent: tpl,
      nzOnOk: () => {
        if (this.checkValid()) {
          this.loading = true;
          this.api.saveRole({ ...this.selectedRow, moduleIds: this.moduleIds }).subscribe(() => this.getData());
        } else {
          return false;
        }
      },
    });
  }

  checkValid() {
    if (!this.selectedRow.name) {
      this.msg.info('请输入角色');
      return false;
    }
    if (!this.moduleIds.length) {
      this.msg.info('请选择权限');
      return false;
    }
    return true;
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

  nzEvent(event: NzFormatEmitEvent): void {
    const result = [];
    event.checkedKeys.forEach(node => this.getAllChildren(node, result));
    this.moduleIds = result;
  }
  private getAllChildren(tree, res = []) {
    if (tree.children.length === 0) {
      res.push(tree.key);
    } else {
      tree.children.forEach(node => this.getAllChildren(node, res));
    }
  }

  reset() {
    this.query = { ...defaultQuery };
    this.loading = true;
    setTimeout(() => this.getData(1));
  }
}

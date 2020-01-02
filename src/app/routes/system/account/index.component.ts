import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { STComponent, STChange, STColumn } from '@delon/abc';
import { RestService } from '@app/service';
import {
  query,
  defaultQuery,
  pages,
  total,
  loading,
  data,
  selectedRows,
  selectedRow,
  GenderList,
  checkMobile,
} from '@app/common';

@Component({
  templateUrl: './index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonComponent implements OnInit {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  GenderList = GenderList;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '姓名', index: 'name' },
    { title: '用户名', index: 'account' },
    { title: '角色', index: 'roleName' },
    { title: '手机号', index: 'tel' },
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
  roleList = [];

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
    this.getRoleList();
  }

  getRoleList() {
    this.api.getRoleList({ pageNo: 1, pageSize: 100 }).subscribe(res => {
      const { rows } = res.data || { rows: [] };
      this.roleList = rows.map(row => ({ label: row.name, value: row.id, value2: row.value }));
    });
  }

  getData(pageIndex?: number) {
    this.loading = true;
    this.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getPropertyAccountList({ ...this.query, loading: true }).subscribe(res => {
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

  addOrEditOrView(tpl: TemplateRef<{}>, type: 'add' | 'edit' | 'view') {
    if (type === 'edit') {
      this.api.getPropertyAccountInfo({ id: this.selectedRow.id }).subscribe(res => {
        if (res.code === '0') {
          this.selectedRow = { ...this.selectedRow, ...res.data };
        }
      });
    }
    this.modalSrv.create({
      nzTitle: type === 'add' ? '新建账号' : '编辑账号',
      nzContent: tpl,
      nzOnOk: () => {
        if (this.checkValid()) {
          this.loading = true;
          this.api
            .savePropertyAccount({
              ...this.selectedRow,
              roleCateEnum: this.roleList.find(role => role.value === this.selectedRow.ramId).value2,
            })
            .subscribe(() => this.getData());
        } else {
          return false;
        }
      },
    });
  }

  checkValid() {
    const { account, name, tel, genderEnum, pwd, pwdRepeat, roleCateEnum } = this.selectedRow;
    if (!account) {
      this.msg.info('请输入用户名');
      return false;
    }
    if (!name) {
      this.msg.info('请输入姓名');
      return false;
    }
    if (!tel) {
      this.msg.info('请输入手机号');
      return false;
    }
    if (!checkMobile(tel)) {
      this.msg.info('手机号格式不对');
      return false;
    }
    if (!genderEnum) {
      this.msg.info('请选择性别');
      return false;
    }
    if (!pwd || !pwdRepeat) {
      this.msg.info('请输入密码或确认密码');
      return false;
    }
    if (pwd !== pwdRepeat) {
      this.msg.info('两次密码不一致');
      return false;
    }
    if (!roleCateEnum) {
      this.msg.info('请选择角色');
      return false;
    }
    return true;
  }

  delete() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deletePropertyAccount([this.selectedRow.id]).subscribe(() => {
          this.getData();
          this.st.clearCheck();
        });
      },
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
}

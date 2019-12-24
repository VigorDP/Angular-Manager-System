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
  SexList,
  checkMobile,
} from '@app/common';

@Component({
  templateUrl: './index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyGroupComponent implements OnInit {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '所属物业集团公司', index: 'company' },
    { title: '姓名', index: 'orderCount' },
    { title: '用户名', index: 'rebateCount' },
    { title: '角色', index: 'rebateCount' },
    { title: '手机号', index: 'rebateCount' },
    {
      title: '操作',
      fixed: 'right',
      width: 300,
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

  @ViewChild('st', { static: true })
  st: STComponent;
  @ViewChild('modalContent', { static: true })
  tpl: TemplateRef<any>;

  genderList = SexList;

  roleList = [];
  departmentList = [];
  companyList = [];

  constructor(
    private api: RestService,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.getData();
  }

  getData(pageIndex?: number) {
    this.loading = true;
    this.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getEnterpriseAccountList(this.query).subscribe(res => {
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

  delete() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deleteEnterpriseAccount([this.selectedRow.id]).subscribe(() => {
          this.getData();
          this.st.clearCheck();
        });
      },
    });
  }

  addOrEditOrView(tpl: TemplateRef<{}>, type: 'add' | 'edit' | 'view' | 'view') {
    if (type === 'edit') {
      this.api.getEnterpriseAccountInfo({ id: this.selectedRow.id }).subscribe(res => {
        if (res.code === '0') {
          this.selectedRow = { ...this.selectedRow, ...res.data };
        }
      });
    }
    this.modalSrv.create({
      nzTitle: type === 'add' ? '新建物业集团公司账号' : '编辑物业集团公司账号',
      nzContent: tpl,
      nzOkDisabled: type === 'view',
      nzWidth: 800,
      nzOnOk: () => {
        if (this.checkValid()) {
          this.loading = true;
          this.api.saveEnterprise(this.selectedRow).subscribe(() => this.getData());
        } else {
          return false;
        }
      },
    });
  }

  checkValid() {
    const { name, account, enterpriseGroupId, tel, genderEnum, pwd, pwdRepeat, roleCateEnum } = this.selectedRow;
    if (!account) {
      this.msg.info('请输入用户名');
      return false;
    }
    if (!name) {
      this.msg.info('请输入姓名');
      return false;
    }
    if (!enterpriseGroupId) {
      this.msg.info('请选择所属物业集团公司');
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
      this.msg.info('请输入密码或者确认密码');
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
}

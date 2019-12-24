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
  ProvinceList,
  getCityOrAreaListByCode,
  checkMobile,
} from '@app/common';

@Component({
  templateUrl: './index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyComponent implements OnInit {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  provinceList = ProvinceList;
  cityList = [];
  areaList = [];
  frontImgUrl = '';
  backImgUrl = '';
  licenseUrl = '';
  enterpriseList = [];
  columns: STColumn[] = [
    { title: '物业公司名称', index: 'name' },
    { title: '下属社区', index: 'socialName' },
    { title: '所属集团公司', index: 'groupName' },
    { title: '负责人', index: 'contact' },
    { title: '负责人手机号', index: 'contactTel' },
    { title: '公司座机号', index: 'landPhone' },
    { title: '创建人', index: 'creator' },
    { title: '创建时间', index: 'gmtCreate' },
    // { title: '审核人', index: 'name' },
    // { title: '审核时间', index: 'rebateCount' },
    // { title: '审核状态', index: 'name' },
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      buttons: [
        {
          text: '查看',
          icon: 'eye',
          click: (item: any) => {
            this.selectedRow = item;
            this.addOrEditOrView(this.tpl, 'view');
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
        // {
        //   text: '审核',
        //   click: (item: any) => {
        //     this.selectedRow = item;
        //     this.addOrEditOrView(this.tpl, 'edit');
        //   },
        // },
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

  constructor(
    private api: RestService,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.query = { ...defaultQuery };
    this.loading = true;
    this.getData();
    this.getEnterpriseList();
  }

  getData(pageIndex?: number) {
    this.loading = true;
    this.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getPropertyCompanyList(this.query).subscribe(res => {
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

  getEnterpriseList() {
    this.api.getEnterpriseList({ pageNo: 1, pageSize: 100 }).subscribe(res => {
      const { rows } = res.data || { rows: [] };
      this.enterpriseList = rows.map(row => ({ label: row.name, value: row.id }));
    });
  }

  addOrEditOrView(tpl: TemplateRef<{}>, type: 'add' | 'edit' | 'view' | 'view') {
    if (type === 'edit' || type === 'view') {
      this.api.getPropertyCompanyInfo({ id: this.selectedRow.id }).subscribe(res => {
        if (res.code === '0') {
          this.selectedRow = { ...this.selectedRow, ...res.data };
          this.frontImgUrl = this.selectedRow.idFrontUrl;
          this.backImgUrl = this.selectedRow.idBackUrl;
          this.licenseUrl = this.selectedRow.licenseUrl;
          this.handleProvinceSelected(this.selectedRow.provinceCode);
          this.handleCitySelected(this.selectedRow.cityCode);
        }
      });
    }
    this.modalSrv.create({
      nzTitle: type === 'add' ? '新建物业公司' : type === 'edit' ? '编辑物业公司' : '查看物业公司',
      nzContent: tpl,
      nzOkDisabled: type === 'view',
      nzWidth: 800,
      nzOnOk: () => {
        if (this.checkValid()) {
          this.loading = true;
          this.api
            .savePropertyCompany({
              ...this.selectedRow,
              idFrontUrl: this.frontImgUrl,
              idBackUrl: this.backImgUrl,
              licenseUrl: this.licenseUrl,
            })
            .subscribe(() => this.getData());
        } else {
          return false;
        }
      },
    });
  }

  checkValid() {
    const {
      name,
      enterpriseGroupId,
      delegate,
      contact,
      contactTel,
      taxCode,
      publicAccount,
      publicBank,
      bankAddress,
    } = this.selectedRow;
    if (!name) {
      this.msg.info('请输入物业公司名称');
      return false;
    }
    if (!enterpriseGroupId) {
      this.msg.info('请选择所属集团公司');
      return false;
    }
    if (!delegate) {
      this.msg.info('请输入法人');
      return false;
    }
    if (!contact) {
      this.msg.info('请输入负责人');
      return false;
    }
    if (!this.frontImgUrl) {
      this.msg.info('请上传身份证国徽面');
      return false;
    }
    if (!this.backImgUrl) {
      this.msg.info('请上传身份证人像面');
      return false;
    }
    if (!contactTel) {
      this.msg.info('请输入负责人手机号');
      return false;
    }
    if (!checkMobile(contactTel)) {
      this.msg.info('手机号格式不对');
      return false;
    }
    if (!this.licenseUrl) {
      this.msg.info('请上传营业执照');
      return false;
    }
    if (!taxCode) {
      this.msg.info('请输入纳税人识别码');
      return false;
    }
    if (!publicBank) {
      this.msg.info('请输入对公银行');
      return false;
    }
    if (!publicAccount) {
      this.msg.info('请输入对公账号');
      return false;
    }
    if (!bankAddress) {
      this.msg.info('请输入开户行地址');
      return false;
    }
    return true;
  }

  delete() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deletePropertyCompany([this.selectedRow.id]).subscribe(() => {
          this.getData();
          this.st.clearCheck();
        });
      },
    });
  }

  handleProvinceSelected(e) {
    this.cityList = getCityOrAreaListByCode(e);
  }

  handleCitySelected(e) {
    console.log('code', query.provinceCode, e);
    this.areaList = getCityOrAreaListByCode(this.query.provinceCode || this.selectedRow.provinceCode, e);
  }

  getImgUrl(e, type) {
    if (type === 'front') {
      this.frontImgUrl = e[0];
    } else if (type === 'back') {
      this.backImgUrl = e[0];
    } else if (type === 'licenseUrl') {
      this.licenseUrl = e[0];
    }
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

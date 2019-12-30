import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { _HttpClient, SettingsService } from '@delon/theme';
import { STComponent, STChange, STColumn } from '@delon/abc';
import { RestService } from '@app/service';
import {
  ProvinceList,
  getCityOrAreaListByCode,
  GenderList,
  query,
  defaultQuery,
  pages,
  total,
  loading,
  data,
  selectedRows,
  selectedRow,
  checkMobile,
  CardList,
  StudyList,
  RalationList,
} from '@app/common';

@Component({
  templateUrl: './index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleComponent implements OnInit {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '姓名', index: 'name' },
    { title: '性别', index: 'gender' },
    { title: '与业主关系', index: 'residentIdRel' },
    { title: '手机号', index: 'tel' },
    { title: '所在楼栋单元', index: 'building' },
    { title: '所在房间', index: 'roomNo' },
    { title: '年龄', index: 'age' },
    { title: '证件号码', index: 'credentialNo' },
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      buttons: [
        {
          text: '审核',
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
            this.addOrEditOrView(this.tpl, 'view');
          },
        },
        {
          text: '删除',
          icon: 'delete',
          click: (item: any) => {
            this.selectedRow = item;
            this.addOrEditOrView(this.tpl, 'view');
          },
        },
        {
          text: '查看',
          icon: 'eye',
          click: (item: any) => {
            this.selectedRow = item;
            this.addOrEditOrView(this.tpl, 'view');
          },
        },
        {
          text: '同步',
          icon: 'eye',
          click: (item: any) => {
            this.selectedRow = item;
            this.addOrEditOrView(this.tpl, 'view');
          },
        },
      ],
    },
  ];

  @ViewChild('st', { static: true })
  st: STComponent;
  @ViewChild('modalContent', { static: true })
  tpl: TemplateRef<any>;

  genderList = GenderList;
  cardList = CardList;
  studyList = StudyList;
  relationList = RalationList;

  faceUrl;
  idFrontUrl;
  idBackUrl;

  constructor(
    private api: RestService,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private settings: SettingsService,
  ) {}

  ngOnInit() {
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
    this.query.socialId = this.settings.app.community.id;
    this.api.getResidentList(this.query).subscribe(res => {
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
    if (type === 'edit' || type === 'view') {
      this.api.getResidentInfo({ id: this.selectedRow.id }).subscribe(res => {
        if (res.code === '0') {
          this.selectedRow = { ...this.selectedRow, ...res.data };
        }
      });
    }
    this.modalSrv.create({
      nzTitle: type === 'add' ? '新增住户' : type === 'edit' ? '编辑住户' : '查看住户',
      nzContent: tpl,
      nzOkDisabled: type === 'view',
      nzWidth: 800,
      nzOnOk: () => {
        if (this.checkValid()) {
          return new Promise(resolve => {
            this.api
              .saveResident({
                ...this.selectedRow,
                faceUrl: this.faceUrl,
                idFrontUrl: this.idFrontUrl,
                idBackUrl: this.idBackUrl,
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
  }

  getImage(e) {
    this.api.uploadBase64({ base64: e }).subscribe(res => {
      if (res.code === 0) {
        this.selectedRow.faceImg = res.link;
      }
    });
  }

  checkValid() {
    const {
      name,
      credentialType,
      credentialNo,
      area,
      contact,
      contactTel,
      provinceCode,
      cityCode,
      districtCode,
    } = this.selectedRow;
    if (!name) {
      this.msg.info('请输入姓名');
      return false;
    }
    if (!credentialType) {
      this.msg.info('请选择证件类型');
      return false;
    }
    if (!credentialNo) {
      this.msg.info('请输入证件号码');
      return false;
    }
    // if (!provinceCode) {
    //   this.msg.info('请选择省份');
    //   return false;
    // }
    // if (!cityCode) {
    //   this.msg.info('请选择城市');
    //   return false;
    // }
    // if (!districtCode) {
    //   this.msg.info('请选择所属区/县');
    //   return false;
    // }
    if (!this.faceUrl) {
      this.msg.info('请上传人脸照片');
      return false;
    }
    if (!this.idFrontUrl) {
      this.msg.info('请上传身份证国徽面');
      return false;
    }
    if (!this.idBackUrl) {
      this.msg.info('请上传身份证人像面');
      return false;
    }
    return true;
  }

  delete() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deleteResident([this.selectedRow.id]).subscribe(() => {
          this.getData();
          this.st.clearCheck();
        });
      },
    });
  }

  getImgUrl(e, type) {
    if (type === 'face') {
      this.faceUrl = e[0];
    } else if (type === 'back') {
      this.idBackUrl = e[0];
    } else if (type === 'front') {
      this.idFrontUrl = e[0];
    }
  }
}

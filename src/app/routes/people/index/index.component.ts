import { getNameByCode } from './../../../common/utils/city';
import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { _HttpClient, SettingsService } from '@delon/theme';
import { STComponent, STChange, STColumn } from '@delon/abc';
import { RestService } from '@app/service';
import dayjs from 'dayjs/esm';
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
  CheckList,
} from '@app/common';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const defaultRoom = {
  firstLevel: null,
  secondLevel: null,
  roomNumber: null,
  residentIdRel: 'MASTER',
  startDate: Date.now(),
  endDate: dayjs(Date.now())
    .add(70, 'year')
    .format(),
  area: null,
};

@Component({
  templateUrl: './index.component.html',
  styles: [
    `
      nz-select {
        width: 140px;
      }
      input {
        width: 140px;
      }
      nz-date-picker {
        width: 140px;
      }
    `,
  ],
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
    { title: '审核状态', index: 'certificationStatus' },
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
            if (this.selectedRow.certificationStatus === '已认证') {
              this.msg.info('该住户已通过认证！');
              return;
            }
            this.showCheck = true;
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
          text: '删除',
          icon: 'delete',
          click: (item: any) => {
            this.selectedRow = item;
            this.delete();
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
      ],
    },
  ];

  @ViewChild('st', { static: true })
  st: STComponent;
  @ViewChild('modalContent', { static: true })
  tpl: TemplateRef<any>;
  @ViewChild('checkTpl', { static: true })
  checkTpl: TemplateRef<any>;

  genderList = GenderList;
  cardList = CardList;
  studyList = StudyList;
  relationList = RalationList;
  checkList = CheckList;
  firstLevel = [];
  secondLevel = [];
  thirdLevel = [];
  rooms = [{ ...defaultRoom }];
  faceUrl;
  idFrontUrl;
  idBackUrl;
  provinceList = ProvinceList;
  cityList = [];
  areaList = [];
  showCheck = false;
  checkData = null;
  inputChange$ = new BehaviorSubject('');

  constructor(
    private api: RestService,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private settings: SettingsService,
  ) {}

  ngOnInit() {
    this.query = { ...defaultQuery };
    if (this.settings.app.community) {
      this.getData();
      this.getSocialProjectStructure();
    }
    this.settings.notify.subscribe(res => {
      this.getData();
      this.getSocialProjectStructure();
    });
    this.inputChange$
      .asObservable()
      .pipe(debounceTime(1000))
      .subscribe(e => {
        e && this.handleCredentialNo(e);
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

  getSocialProjectStructure() {
    this.api.getSocialProjectStructure().subscribe(res => {
      if (res.code === '0') {
        this.firstLevel = res.data.map(item => ({
          label: item.building + '栋',
          value: item.building,
          children: item.socialUnitVos,
        }));
      }
    });
  }

  selectSecondLevel(value) {
    this.secondLevel = this.firstLevel
      .find(item => item.value === value)
      .children.map(item => ({ label: item.unit + '单元', value: item.unit, children: item.roomNos }));
  }

  selectThirdLevel(value) {
    this.thirdLevel = this.secondLevel
      .find(item => item.value === value)
      .children.map(item => ({ label: item + '室', value: item }));
  }

  handleCheck(e) {
    const id = this.msg.loading('审核中，请稍后...', { nzDuration: 0 }).messageId;
    this.api.checkResident({ id: this.selectedRow.id, isPassed: e.passed, reason: e.reason || '' }).subscribe(res => {
      if (res.code === '0') {
        this.showCheck = false;
        this.getData();
      }
      this.msg.remove(id);
    });
  }

  handleResidentChange(e, item) {
    if (e === 'VISITOR' || e === 'MANAGER' || e === 'OTHER') {
      item.startDate = Date.now();
      item.endDate = dayjs(item.startDate)
        .add(1, 'day')
        .valueOf();
      return;
    }
    if (e === 'GUEST') {
      item.startDate = Date.now();
      item.endDate = dayjs(item.startDate)
        .add(1, 'year')
        .valueOf();
      return;
    }
    item.startDate = Date.now();
    item.endDate = dayjs(item.startDate)
      .add(70, 'year')
      .valueOf();
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
          this.rooms = this.selectedRow.rooms;
          this.faceUrl = this.selectedRow.faceUrl;
          this.idFrontUrl = this.selectedRow.idFrontUrl;
          this.idBackUrl = this.selectedRow.idBackUrl;
          this.selectedRow.provinceCode && this.handleProvinceSelected(this.selectedRow.provinceCode);
          this.selectedRow.cityCode && this.handleCitySelected(this.selectedRow.cityCode);
          this.rooms.forEach(room => {
            room.firstLevel && this.selectSecondLevel(room.firstLevel);
            room.secondLevel && this.selectThirdLevel(room.secondLevel);
          });
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
          const obj = {
            ...this.selectedRow,
            birthday: this.selectedRow.birthday && dayjs(this.selectedRow.birthday).format('YYYY-MM-DD HH:mm:ss'),
            faceUrl: this.faceUrl,
            idFrontUrl: this.idFrontUrl,
            idBackUrl: this.idBackUrl,
            provinceName: this.selectedRow.provinceCode && getNameByCode(this.selectedRow.provinceCode),
            cityName: this.selectedRow.cityCode && getNameByCode(this.selectedRow.cityCode),
            districtName: this.selectedRow.districtCode && getNameByCode(this.selectedRow.districtCode),
            rooms: this.rooms.map(item => ({
              ...item,
              startDate: dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss'),
              endDate: dayjs(item.endDate).format('YYYY-MM-DD HH:mm:ss'),
            })),
          };
          return new Promise(resolve => {
            this.api.saveResident(obj).subscribe(res => {
              if (res.code === '0') {
                resolve();
                this.rooms = [];
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

  handleCredentialNo(e) {
    // 新建用户
    if (!this.selectedRow.id) {
      this.api
        .getResidentInfoByCredentialNo({
          credentialNo: e,
          credentialType: this.selectedRow.credentialType || 'ID_CARD',
        })
        .subscribe(res => {
          if (res.data) {
            this.modalSrv.confirm({
              nzTitle: '检测到该住户信息已存在，是否使用该信息?',
              nzOnOk: () => {
                this.selectedRow = { ...this.selectedRow, ...res.data };
                this.selectedRow.rooms = [];
                this.faceUrl = this.selectedRow.faceUrl;
                this.idFrontUrl = this.selectedRow.idFrontUrl;
                this.idBackUrl = this.selectedRow.idBackUrl;
                this.selectedRow.provinceCode && this.handleProvinceSelected(this.selectedRow.provinceCode);
                this.selectedRow.cityCode && this.handleCitySelected(this.selectedRow.cityCode);
              },
            });
          }
        });
    }
  }

  getImage(e) {
    this.api.uploadBase64({ base64: e }).subscribe(res => {
      if (res.code === 0) {
        this.selectedRow.faceImg = res.link;
      }
    });
  }

  checkValid() {
    const { name, gender, tel, credentialType, credentialNo } = this.selectedRow;
    if (!name) {
      this.msg.info('请输入姓名');
      return false;
    }
    if (!gender) {
      this.msg.info('请选择性别');
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
    if (!tel) {
      this.msg.info('请输入手机号码');
      return false;
    }
    if (!checkMobile(tel)) {
      this.msg.info('手机号码格式有误');
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
    if (!this.faceUrl) {
      this.msg.info('请上传人脸照片');
      return false;
    }
    for (const room of this.rooms) {
      if (!room.firstLevel) {
        this.msg.info('请选择楼栋');
        return false;
      }
      if (!room.secondLevel) {
        this.msg.info('请选择单元');
        return false;
      }
      if (!room.roomNumber) {
        this.msg.info('请选择房间');
        return false;
      }
      if (!room.startDate) {
        this.msg.info('请选择开始日期');
        return false;
      }
      if (!room.endDate) {
        this.msg.info('请选择结束日期');
        return false;
      }
      if (!room.residentIdRel) {
        this.msg.info('请选择角色');
        return false;
      }
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

  addRoom() {
    this.rooms.push({ ...defaultRoom });
  }

  deleteRoom(i) {
    this.rooms.splice(i, 1);
  }

  handleProvinceSelected(e) {
    this.cityList = getCityOrAreaListByCode(e);
  }

  handleCitySelected(e) {
    this.areaList = getCityOrAreaListByCode(this.query.provinceCode || this.selectedRow.provinceCode, e);
  }
}

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
  NationUtil,
  NationEnum,
  checkPassword,
  checkMobile,
} from '@app/common';
import * as dayjs from 'dayjs';

@Component({
  templateUrl: './index.component.html',
  styleUrls: [`./index.scss`, '../../../common/styles/common.css'],
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
    { title: '角色', index: 'role' },
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
            this.ret = [];
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
  communityList = [];
  ret = [];
  nationList = NationUtil.getNationList();
  orgStructureList = [];
  showTagManager = false;
  showArchitectTree = false;
  tagList = [];
  genderList = GenderList;
  studyList = StudyList;
  cardList = CardList;
  provinceList = ProvinceList;
  cityList = [];
  areaList = [];
  cityList2 = [];
  areaList2 = [];
  roleList = [];
  @ViewChild('st', { static: true })
  st: STComponent;
  @ViewChild('modalContent', { static: true })
  tpl: TemplateRef<any>;

  searchName = null;

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
    this.query = { ...defaultQuery };
    if (this.settings.app.community) {
      this.getData();
      this.getSocialList();
      this.getOrgStructureList();
      this.getRoleList();
    }
    this.sub = this.settings.notify.subscribe(res => {
      this.getData();
      this.getSocialList();
      this.getOrgStructureList();
      this.getRoleList();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getData(pageIndex?: number) {
    this.loading = true;
    this.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getStaffList(this.query).subscribe(res => {
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
    const modal = this.modalSrv.create({
      nzTitle: type === 'add' ? '新建成员' : type === 'edit' ? '编辑成员' : '查看成员',
      nzContent: tpl,
      nzOkDisabled: type === 'view',
      nzWidth: 800,
      nzOnOk: () => {
        if (this.checkValid()) {
          return new Promise(resolve => {
            this.api.saveStaff(this.selectedRow).subscribe(res => {
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
        this.api.getStaffInfo(this.selectedRow.id).subscribe(res => {
          if (res.code === '0') {
            this.selectedRow = {
              ...this.selectedRow,
              ...res.data,
            };
            this.selectedRow.pwdRepeat = this.selectedRow.pwd;
            if (this.selectedRow.ramId) {
              this.selectedRow.app = true;
            }
            if (this.selectedRow.socialIds && this.selectedRow.socialIds.length) {
              this.selectedRow.socialIds.forEach(id => {
                const select = this.communityList.filter(i => i.id === id)[0];
                select.checked = true;
                this.ret.push(select);
              });
            }
          }
        });
      }
    });
  }

  checkValid() {
    const {
      name,
      gender,
      tel,
      pwd,
      pwdRepeat,
      orgStructureId,
      credentialType,
      credentialNo,
      app,
      ramId,
    } = this.selectedRow;
    if (!name) {
      this.msg.info('请输入姓名');
      return false;
    }
    if (!gender) {
      this.msg.info('请选择性别');
      return false;
    }
    if (!checkMobile(tel)) {
      this.msg.info('请输入正确的手机号');
      return false;
    }
    if (!pwd || !pwdRepeat) {
      this.msg.info('请输入密码或确认密码');
      return false;
    }
    if (pwdRepeat !== pwd) {
      this.msg.info('密码输入不一致');
      return false;
    }
    if (app) {
      if (!ramId) {
        this.msg.info('请选择所属角色');
        return false;
      }
      this.selectedRow.roleCateEnum = this.roleList.find(role => role.value === this.selectedRow.ramId).value2;
    } else {
      this.selectedRow.roleCateEnum = null;
      this.selectedRow.ramId = null;
    }
    if (!orgStructureId) {
      this.msg.info('请选择所在部门');
      return false;
    }
    if (!credentialType) {
      this.msg.info('请选择证件类型');
      return false;
    }
    if (!credentialNo || !credentialNo.trim().length) {
      this.msg.info('请输入证件号码');
      return false;
    }
    if (this.ret.length) {
      this.selectedRow.socialIds = this.ret.map(i => i.id);
    }
    return true;
  }

  delete() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deleteStaff([this.selectedRow.id]).subscribe(() => {
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
        this.api.deleteStaff(ids).subscribe(() => {
          this.getData();
          this.st.clearCheck();
        });
      },
    });
  }

  handleProvinceSelected(e) {
    this.cityList = getCityOrAreaListByCode(e);
  }

  handleProvinceSelected2(e) {
    this.cityList2 = getCityOrAreaListByCode(e);
  }

  handleCitySelected(e) {
    this.areaList = getCityOrAreaListByCode(this.query.provinceCode || this.selectedRow.provinceCode, e);
  }
  handleCitySelected2(e) {
    this.areaList2 = getCityOrAreaListByCode(this.query.provinceCode2 || this.selectedRow.provinceCode2, e);
  }

  getSocialList() {
    this.api.getSocialProjectList({ pageNo: 1, pageSize: 1000 }).subscribe(res => {
      if (res.code !== '0' || !res.data.rows) {
        this.communityList = [];
        return;
      }
      const { rows } = res.data;
      rows.forEach(i => {
        i.checked = false;
      });
      this.communityList = rows;
    });
  }

  searchCommunity(socialName: string) {
    if (!this.searchName || this.searchName.trim() === '') {
      return true;
    }
    if (socialName.indexOf(this.searchName) > -1) {
      return true;
    }
    return false;
  }

  selectCommunity(item: any) {
    this.ret.push(item);
  }

  removeSelectCommunity(item: any, idx: number) {
    this.ret.splice(idx, 1);
    item.checked = false;
  }

  getOrgStructureList() {
    this.api.getOrgStructureList({}).subscribe(res => {
      if (res.code !== '0') {
        this.orgStructureList = [];
        return;
      }
      this.orgStructureList = this.transformToTreeData(res.data);
    });
  }

  transformToTreeData(data) {
    if (!data) return [];
    const result = data.map(item => {
      return {
        key: item.id,
        title: item.name,
        parentId: item.parentId,
        children: this.transformToTreeData(item.vos),
        isLeaf: !item.vos,
        checked: false,
      };
    });
    return result;
  }

  getRoleList() {
    this.api.getRoleList({ pageNo: 1, pageSize: 100 }).subscribe(res => {
      const { rows } = res.data || { rows: [] };
      this.roleList = rows.map(row => ({ label: row.name, value: row.id, value2: row.value }));
    });
  }
}

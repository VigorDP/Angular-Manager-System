import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SettingsService } from '@delon/theme';
import { STChange, STColumn, STComponent } from '@delon/abc';
import { RestService } from '@app/service';
import {
  checkMobile,
  data,
  defaultQuery,
  GenderList,
  getCityOrAreaListByCode,
  getNameByCode,
  loading,
  pages,
  ProvinceList,
  query,
  selectedRow,
  selectedRows,
  total,
} from '@app/common';
import { cloneDeep } from 'lodash';

@Component({
  templateUrl: './index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityInfoComponent implements OnInit {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    { title: '公告标题', index: 'socialName' },
    { title: '发布人', index: 'contact' },
    { title: '所属标签', index: 'contactTel' },
    { title: '是否置顶', index: 'address' },
    { title: '公告类型', index: 'area' },
    { title: '发布时间', index: 'descr' },
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
            this.addOrEditOrView(this.tpl, 'view');
          },
        },
        {
          text: '置顶',
          icon: 'edit',
          iif: item => item.status === 'UNTOP',
          iifBehavior: 'hide',
          click: (item: any) => {
            this.selectedRow = item;
            this.addOrEditOrView(this.tpl, 'edit');
          },
        },
        {
          text: '取消置顶',
          icon: 'edit',
          iif: item => item.status === 'TOP',
          iifBehavior: 'hide',
          click: (item: any) => {
            this.selectedRow = item;
            this.cancelTop();
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

  genderList = GenderList;
  provinceList = ProvinceList;
  cityList = [];
  areaList = [];
  images = ''; // 小区效果图
  dateRange = null;

  /*标签管理*/
  tagObject = {
    query: cloneDeep(query),
    pages: cloneDeep(pages),
    total,
    loading,
    data: cloneDeep(data),
    selectedRow: cloneDeep(selectedRow),
    columns: [
      { title: '标签', index: 'socialName' },
      {
        title: '操作',
        buttons: [
          {
            text: '编辑',
            icon: 'edit',
            click: (item: any) => {
              this.tagObject.selectedRow = item;
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
  ) {}

  ngOnInit() {
    this.query = { ...defaultQuery };
    this.getData();
  }

  getData(pageIndex?: number) {
    this.loading = true;
    this.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getSocialProjectList(this.query).subscribe(res => {
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
      this.api.getSocialProjectInfo({ id: this.selectedRow.id }).subscribe(res => {
        if (res.code === '0') {
          this.selectedRow = { ...this.selectedRow, ...res.data };
          this.handleProvinceSelected(this.selectedRow.provinceCode);
          this.handleCitySelected(this.selectedRow.cityCode);
        }
      });
    }
    this.modalSrv.create({
      nzTitle: type === 'add' ? '新增公告' : type === 'edit' ? '编辑公告' : '查看公告',
      nzContent: tpl,
      nzOkDisabled: type === 'view',
      nzWidth: 800,
      nzOnOk: () => {
        if (this.checkValid()) {
          return new Promise(resolve => {
            this.api
              .saveSocialProject({
                ...this.selectedRow,
                cityName: getNameByCode(this.selectedRow.cityCode),
                districtName: getNameByCode(this.selectedRow.districtCode),
                provinceName: getNameByCode(this.selectedRow.provinceCode),
              })
              .subscribe(res => {
                if (res.code === '0') {
                  resolve();
                  this.getData();
                  this.settings.setApp({
                    ...this.settings.app,
                    event: 'SOCIAL_CHANGED',
                    targetId: this.selectedRow.id,
                  });
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

  handleProvinceSelected(e) {
    this.cityList = getCityOrAreaListByCode(e);
  }

  handleCitySelected(e) {
    this.areaList = getCityOrAreaListByCode(this.query.provinceCode || this.selectedRow.provinceCode, e);
  }

  checkValid() {
    const { name, area, contact, contactTel, provinceCode, cityCode, districtCode } = this.selectedRow;
    if (!name) {
      this.msg.info('请输入社区名称');
      return false;
    }
    if (!provinceCode) {
      this.msg.info('请选择省份');
      return false;
    }
    if (!cityCode) {
      this.msg.info('请选择城市');
      return false;
    }
    if (!districtCode) {
      this.msg.info('请选择所属区/县');
      return false;
    }
    if (!area) {
      this.msg.info('请输入管理面积');
      return false;
    }
    if (!contact) {
      this.msg.info('请输入负责人');
      return false;
    }
    if (!contactTel) {
      this.msg.info('请输入负责人手机号');
      return false;
    }
    if (!checkMobile(contactTel)) {
      this.msg.info('手机号格式有误');
      return false;
    }
    return true;
  }

  getImgUrl(e) {
    this.images = e;
  }

  delete() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deleteSocialProject([this.selectedRow.id]).subscribe(() => {
          this.getData();
          this.settings.setApp({
            ...this.settings.app,
            event: 'SOCIAL_CHANGED',
            targetId: this.selectedRow.id,
          });
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
    this.api.getSocialProjectList(this.query).subscribe(res => {
      this.tagObject.loading = false;
      const { rows, total: totalItem } = res.data || { rows: [], total: 0 };
      this.tagObject.data = rows;
      this.tagObject.total = totalItem;
      this.tagObject.pages = {
        ...this.tagObject.pages,
        total: `共 ${totalItem} 条记录`,
      };
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
              .saveSocialProject({
                ...this.selectedRow,
                cityName: getNameByCode(this.selectedRow.cityCode),
                districtName: getNameByCode(this.selectedRow.districtCode),
                provinceName: getNameByCode(this.selectedRow.provinceCode),
              })
              .subscribe(res => {
                if (res.code === '0') {
                  resolve();
                  this.getData();
                  this.settings.setApp({
                    ...this.settings.app,
                    event: 'SOCIAL_CHANGED',
                    targetId: this.selectedRow.id,
                  });
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
    return true;
  }

  deleteTag() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deleteSocialProject([this.selectedRow.id]).subscribe(() => {
          this.getData();
          this.settings.setApp({
            ...this.settings.app,
            event: 'SOCIAL_CHANGED',
            targetId: this.selectedRow.id,
          });
          this.tagSt.clearCheck();
        });
      },
    });
  }
}

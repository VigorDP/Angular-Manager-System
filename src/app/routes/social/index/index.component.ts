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
  getNameByCode,
} from '@app/common';
import { AmapGeocoderWrapper, AmapGeocoderService } from 'ngx-amap';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  templateUrl: './index.component.html',
  styleUrls: ['../../../common/styles/common.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectComponent implements OnInit {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '社区名称', index: 'socialName' },
    { title: '社区负责人', index: 'contact' },
    { title: '联系电话', index: 'contactTel' },
    { title: '地址', index: 'address' },
    { title: '社区面积（平方米）', index: 'area' },
    { title: '备注', index: 'descr' },
    { title: '创建人', index: 'creator' },
    { title: '创建时间', index: 'gmtCreate' },
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
          text: '查看',
          icon: 'eye',
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

  searchPlugin: Promise<AmapGeocoderWrapper>;
  center: any;
  searchChange$ = new BehaviorSubject('');

  constructor(
    private api: RestService,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private settings: SettingsService,
    AmapGeocoder: AmapGeocoderService,
  ) {
    this.searchPlugin = AmapGeocoder.of();
  }

  ngOnInit() {
    this.query = { ...defaultQuery };
    this.getData();
    this.searchChange$
      .asObservable()
      .pipe(debounceTime(1000))
      .subscribe(() => {
        this.searchLocation();
      });
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

  searchLocation() {
    const address = this.selectedRow.address;
    if (!!address) {
      // 使用AMap.Geocoder.getLocation方法获取地理编码:
      this.searchPlugin
        .then(geocoder => geocoder.getLocation(address))
        .then(data => {
          if (data.status === 'complete' && data.result.info === 'OK') {
            this.center = data.result.geocodes[0].location;
            this.selectedRow.longitude = this.center.lng;
            this.selectedRow.latitude = this.center.lat;
          }
        });
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
          this.searchChange$.next(this.selectedRow.address);
        }
      });
    }
    this.modalSrv.create({
      nzTitle: type === 'add' ? '新增社区' : type === 'edit' ? '编辑社区' : '查看社区',
      nzContent: tpl,
      nzOkDisabled: type === 'view',
      nzWidth: 800,
      nzOnOk: () => {
        if (this.checkValid()) {
          return new Promise(resolve => {
            this.api
              .saveSocialProject({
                ...this.selectedRow,
                images: this.images,
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
                    event: 'LIST-CHANGED',
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

  searchChange() {
    this.searchChange$.next('');
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
    this.images = e[0];
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
}

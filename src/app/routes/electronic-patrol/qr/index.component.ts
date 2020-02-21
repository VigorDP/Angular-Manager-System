import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
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
} from '@app/common';

const BuildingTypeList = [
  { label: '高层', value: 'HIGH' },
  { label: '别墅', value: 'VILLA' },
];
@Component({
  templateUrl: './index.component.html',
  styleUrls: ['../../../common/styles/common.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrComponent implements OnInit, OnDestroy {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '楼栋名称', index: 'name' },
    { title: '单元数量', index: 'buildingUnit' },
    { title: '地上层数', index: 'upstairFloors' },
    { title: '地下层数', index: 'downstairFloors' },
    { title: '每层户数', index: 'households' },
    { title: '楼栋类型', index: 'cate' },
    { title: '备注', index: 'descr' },
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

  @ViewChild('st', { static: true })
  st: STComponent;
  @ViewChild('modalContent', { static: true })
  tpl: TemplateRef<any>;

  genderList = GenderList;
  provinceList = ProvinceList;
  buildingTypeList = BuildingTypeList;
  cityList = [];
  areaList = [];
  sub = null;
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
    }
    this.sub = this.settings.notify.subscribe(res => {
      this.getData();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getData(pageIndex?: number) {
    this.loading = true;
    this.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getBuildingList(this.query).subscribe(res => {
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
    if (type === 'edit') {
      this.api.getBuildingInfo({ id: this.selectedRow.id }).subscribe(res => {
        if (res.code === '0') {
          this.selectedRow = { ...this.selectedRow, ...res.data };
        }
      });
    }
    this.modalSrv.create({
      nzTitle: type === 'add' ? '新增结构' : '编辑结构',
      nzContent: tpl,
      nzOkDisabled: type === 'view',
      nzWidth: 800,
      nzOnOk: () => {
        if (this.checkValid()) {
          return new Promise(resolve => {
            this.api.saveBuilding(this.selectedRow).subscribe(res => {
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
  delete() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deleteBuilding([this.selectedRow.id]).subscribe(() => {
          this.getData();
          this.st.clearCheck();
        });
      },
    });
  }

  checkValid() {
    const { buildingName, buildingNo, upstairFloors, households, buildingUnit, cate } = this.selectedRow;
    if (!buildingNo) {
      this.msg.info('请输入楼栋编号');
      return false;
    }
    if (!buildingName) {
      this.msg.info('请输入楼栋名称');
      return false;
    }
    if (!upstairFloors) {
      this.msg.info('请输入地上楼层数');
      return false;
    }
    if (!households) {
      this.msg.info('请输入每层户数');
      return false;
    }
    if (!buildingUnit) {
      this.msg.info('请输入楼栋单元数量');
      return false;
    }
    if (!cate) {
      this.msg.info('请输入楼栋类别');
      return false;
    }
    return true;
  }
}

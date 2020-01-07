import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SettingsService } from '@delon/theme';
import { STChange, STColumn, STComponent } from '@delon/abc';
import { RestService } from '@app/service';
import { data, defaultQuery, loading, pages, query, selectedRow, selectedRows, total } from '@app/common';
import * as dayjs from 'dayjs';

const DAY_FORMAT = 'yyyy-MM-dd';
const MONTH_FORMAT = 'yyyy-MM';

@Component({
  templateUrl: './index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeStandardComponent implements OnInit {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    {
      title: '收费规则类型', index: 'cate',
      format: (item) => this.feeTypeList.filter(i => i.value === item.cate)[0].label,
    },
    {
      title: '收费标准', index: 'price',
      format: (item) => `${item.price} (${item.unit})`,
    },
    { title: '起始时间', index: 'starDate' },
    { title: '结束时间', index: 'endDate' },
    /* { title: '启用状态', index: 'address' },*/
    { title: '创建人', index: 'creator' },
    { title: '创建时间', index: 'createTime' },
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      buttons: [
        /* {
           text: '停用',
           icon: 'stop',
           click: (item: any) => {
             this.selectedRow = item;
             this.addOrEditOrView(this.tpl, 'view');
           },
         },*/
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

  feeTypeList = [
    {
      value: 'PROPERTY',
      label: '物业费',
    },
    {
      value: 'HEATING',
      label: '暖气费',
    },
  ];
  buildingTypeList = [
    {
      value: 'HIGH',
      label: '高层',
    },
    {
      value: 'VILLA',
      label: '别墅',
    },
  ];

  dateRange = null;
  dateFormat = MONTH_FORMAT;

  constructor(
    private api: RestService,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private settings: SettingsService,
  ) {
  }

  ngOnInit() {
    this.query = { ...defaultQuery };
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
    this.api.getFeeList(this.query).subscribe(res => {
      this.loading = false;
      const { rows, total: totalItem } = res.data || { rows: [], total: 0 };
      this.data = rows || [];
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
        console.log('this.selectedRows', this.selectedRows);
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
      this.dateRange = [this.selectedRow.starDate, this.selectedRow.endDate];
    } else {
      this.dateRange = null;
    }
    if (this.selectedRow.cate === 'HEATING') {
      this.dateFormat = DAY_FORMAT;
    } else {
      this.dateFormat = MONTH_FORMAT;
    }
    this.modalSrv.create({
      nzTitle: type === 'add' ? '新增费用标准' : '编辑费用标准',
      nzContent: tpl,
      nzWidth: 800,
      nzOnOk: () => {
        if (this.checkValid()) {
          return new Promise(resolve => {
            this.api
              .saveFee({
                ...this.selectedRow,
                creator: this.settings.user.name,
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

  checkValid() {
    const { cate, price, unit, buildingCate } = this.selectedRow;
    if (!cate) {
      this.msg.info('请选择收费类型');
      return false;
    }
    if (!price || price <= 0) {
      this.msg.info('请输入正确的价格');
      return false;
    }
    if (!unit) {
      this.msg.info('请输入单位');
      return false;
    }
    if (!buildingCate) {
      this.msg.info('请选择楼栋类型');
      return false;
    }
    if (!this.dateRange) {
      this.msg.info('请选择起始日期');
      return false;
    }
    if (cate === 'HEATING') {
      this.selectedRow.starDate = dayjs(this.dateRange[0]).format('YYYY-MM-DD');
      this.selectedRow.endDate = dayjs(this.dateRange[1]).format('YYYY-MM-DD');
    } else {
      this.selectedRow.starDate = dayjs(this.dateRange[0]).format('YYYY-MM');
      this.selectedRow.endDate = dayjs(this.dateRange[1]).format('YYYY-MM');
    }
    return true;
  }

  handleFeeTypeSelected(e) {
    this.getData(1);
  }


  delete() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        /*  this.api.deletePoliticsNews([this.selectedRow.id]).subscribe(() => {
            this.getData();
          });*/
      },
    });
  }


  cateChange() {
    this.selectedRow.cate === 'HEATING' ? this.dateFormat = DAY_FORMAT : this.dateFormat = MONTH_FORMAT;
  }
}

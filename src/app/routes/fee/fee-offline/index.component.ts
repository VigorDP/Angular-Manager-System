import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { STChange, STColumn, STComponent } from '@delon/abc';
import { RestService } from '@app/service';
import {
  data,
  defaultQuery,
  getCityOrAreaListByCode,
  loading,
  pages,
  query,
  selectedRow,
  selectedRows,
  total,
} from '@app/common';
import * as dayjs from 'dayjs';
import { SettingsService } from '@delon/theme';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeOfflineComponent implements OnInit {
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    { title: '业主姓名', index: 'name' },
    { title: '所在楼栋单元', index: 'building' },
    { title: '所在房间', index: 'roomNo' },
    { title: '收费项目', index: 'type' },
    { title: '收费标准', index: 'standard' },
    { title: '应缴纳月份', index: 'startDate' },
    { title: '应缴纳费用', index: 'total' },
    {
      title: '缴纳状态', index: 'status',
      format: (item) => item.status ? '已缴纳' : '未缴纳',
    },
    { title: '缴费方式', index: 'channel' },
    {
      title: '是否催缴', index: 'urged',
      format: (item) => item.urged ? '已催缴' : '未催缴',
    },
    { title: '缴费时间', index: 'startDate' },
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      buttons: [
        /*{
          text: '线下缴费',
          icon: 'edit',
          click: (item: any) => {
            this.selectedRow = item;
            //this.addOrEditOrView(this.tpl, 'view');
          },
        },*/
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

  paidStatusList = [
    {
      label: '已缴纳',
      value: true,
    },
    {
      label: '未缴纳',
      value: false,
    },
  ];

  dateRange = null;

  firstLevel = [];
  secondLevel = [];
  thirdLevel = [];
  rooms = [{ ...defaultRoom }];

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
      this.getSocialProjectStructure();
    }
    this.settings.notify.subscribe(res => {
      this.getData();
      this.getSocialProjectStructure();
    });
  }

  getData(pageIndex?: number) {
    this.loading = true;
    this.query.pageNo = pageIndex ? pageIndex : this.query.pageNo;
    this.api.getFeeList(this.query).subscribe(res => {
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
    this.dateRange = null;
    this.loading = true;
    setTimeout(() => this.getData(1));
  }

  addOrEditOrView(tpl: TemplateRef<{}>, type: 'add' | 'edit' | 'view') {
    this.api.getFeeInfo(this.selectedRow.id).subscribe(res => {
      if (res.code === '0') {
        this.selectedRow = { ...this.selectedRow, ...res.data };
      }
    });
    this.modalSrv.create({
      nzTitle: type === 'view' ? '查看详情' : '线下缴费',
      nzContent: tpl,
      nzWidth: 500,
      nzOnOk: () => {
        // this.http.post('/api/package/save', this.selectedRow).subscribe(() => this.getData());
      },
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


  selectDate() {
    if (!this.dateRange) {
      this.query.feesEnd = null;
      this.query.feesStart = null;
      return;
    }
    this.query.feesStart = `${dayjs(this.dateRange[0]).format('YYYY-MM-DD')} 00:00:00`;
    this.query.feesEnd = `${dayjs(this.dateRange[1]).format('YYYY-MM-DD')} 23:59:59`;
  }

}

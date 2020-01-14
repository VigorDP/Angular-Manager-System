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
import { STComponent } from '@delon/abc';
import { RestService } from '@app/service';
import { query, defaultQuery } from '@app/common';

@Component({
  templateUrl: './index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsageComponent implements OnInit, OnDestroy {
  @ViewChild('st', { static: true })
  st: STComponent;
  @ViewChild('modalContent', { static: true })
  tpl: TemplateRef<any>;
  query = query;

  data = [];
  firstLevel = [];
  secondLevel = [];
  thirdLevel = [];
  statistics = {} as any;
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
      this.getBuildingStructure();
      this.getSocialProjectStructure();
    }
    this.sub = this.settings.notify.subscribe(() => {
      this.getBuildingStructure();
      this.getSocialProjectStructure();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // 查询列表用
  getBuildingStructure() {
    this.api.getBuildingStructure(this.query).subscribe(res => {
      if (res.code === '0') {
        this.data = res.data.vos;
        this.statistics = {
          masterCount: res.data.masterCount,
          guestCount: res.data.guestCount,
          otherCount: res.data.otherCount,
        };
        this.cdr.detectChanges();
      }
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

  setColor(row) {
    if (row.type === 0) {
      return { color: 'white', background: 'blue' };
    } else if (row.type === 1) {
      return { color: 'white', background: 'green' };
    } else {
      return { color: 'black', background: 'white' };
    }
  }

  reset() {
    this.query = { ...defaultQuery };
    setTimeout(() => this.getBuildingStructure());
  }
}

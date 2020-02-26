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
    { title: '', index: 'id', type: 'checkbox' },
    { title: '二维码名称', index: 'name' },
    { title: '二维码编号', index: 'buildingUnit' },
    { title: '创建时间', index: 'upstairFloors' },
    { title: '二维码', index: 'location' },
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      buttons: [
        {
          text: '下载',
          icon: 'download',
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
    this.api.getPetrolQrCodeList(this.query).subscribe(res => {
      this.loading = false;
      const { rows, total: totalItem } = res.data || { rows: [], total: 0 };
      this.data = rows;
      this.data.forEach(item => {
        const o = {
          id: item.id,
          type: 'hmf',
          location: item.location,
        };
        item.qrdata = JSON.stringify(o);
      });
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
    this.modalSrv.create({
      nzTitle: type === 'add' ? '新增二维码' : '编辑二维码',
      nzWidth: 800,
      nzContent: tpl,
      nzFooter: !this.selectedRow.qrdata
        ? [
            {
              label: '生成二维码',
              type: 'primary',
              onClick: this.handleOk.bind(this),
            },
          ]
        : [
            {
              label: '立即保存',
              type: 'primary',
              onClick: this.saveImg.bind(this),
            },
            {
              label: '稍后保存',
              type: 'primary',
              onClick: () => {
                return new Promise(res => res());
              },
            },
            {
              label: '继续生成',
              type: 'primary',
              onClick: () => (this.selectedRow = {}),
            },
          ],
    });
  }

  public handleOk(): any {
    if (this.checkValid()) {
      return new Promise(resolve => {
        this.api.savePetrolQrCode(this.selectedRow).subscribe(res => {
          if (res.code === '0') {
            resolve();
            const data = {
              type: 'hmf',
              ...res.data,
            };
            this.selectedRow.qrdata = JSON.stringify(data);
            this.selectedRow.id = res.data.id;
          } else {
            resolve(false);
          }
        });
      });
    } else {
      return false;
    }
  }

  private checkValid() {
    if (!this.selectedRow.location || !this.selectedRow.location.trim()) {
      this.msg.info('二维码名称不能为空');
      return;
    }
    return true;
  }

  // 下载二维码图片
  public saveImg(src) {
    setTimeout(() => {
      const image = new Image();
      // 解决跨域 Canvas 污染问题
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = src;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, image.width, image.height);
        const url = canvas.toDataURL('image/png');
        // 生成一个a元素
        const a = document.createElement('a');
        // 创建一个单击事件
        const event = new MouseEvent('click');
        // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
        a.download = this.selectedRow.location || '下载图片名称';
        // 将生成的URL设置为a.href属性
        a.href = url;
        // 触发a的单击事件
        a.dispatchEvent(event);
      };
    }, 0);
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

  batchDelete() {
    if (!this.selectedRows.length) {
      this.msg.info('请选择删除项');
      return false;
    }
    const ids = this.selectedRows.map(item => item.id);
    this.modalSrv.confirm({
      nzTitle: '是否确认删除？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.api.deleteFeeStandard(ids).subscribe(() => {
          this.getData();
          this.st.clearCheck();
        });
      },
    });
  }

  batchSave() {
    if (!this.selectedRows.length) {
      this.msg.info('请选择下载项');
      return false;
    }
  }

  allSave() {}
}

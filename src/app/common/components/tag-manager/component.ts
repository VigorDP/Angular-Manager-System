// @ts-nocheck
import {
  Component,
  EventEmitter,
  OnInit,
  Input,
  Output,
  OnChanges,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { STChange, STColumn, STComponent } from '@delon/abc';
import { data, loading, pages, query, selectedRow, selectedRows, total } from '../../interfaces';

@Component({
  selector: 'app-tag-manager',
  templateUrl: './index.html',
  styles: [],
})
export class TagManagerComponent implements OnChanges {
  @Input() show = false;
  @Input() noticeCate;
  @Input() listApi;
  @Input() saveApi;
  @Input() deleteApi;
  @Output() public close = new EventEmitter<any>();

  isVisible = false;
  agoName = undefined;
  query = query;
  pages = pages;
  total = total;
  loading = loading;
  data = data;
  selectedRows = selectedRows;
  selectedRow = selectedRow;
  columns: STColumn[] = [
    { title: '标签', index: 'name' },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          icon: 'edit',
          click: (item: any) => {
            this.selectedRow = item;
            this.agoName = this.selectedRow.name;
            this.addOrEditTag(this.tagTpl, 'edit');
          },
        },
        {
          text: '删除',
          icon: 'delete',
          click: (item: any) => {
            this.selectedRow = item;
            this.deleteTag();
          },
        },
      ],
    },
  ];
  @ViewChild('tagSt', { static: true })
  tagSt: STComponent;
  @ViewChild('tagModalContent', { static: true })
  tagTpl: TemplateRef<any>;

  constructor(private msg: NzMessageService, public modalSrv: NzModalService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(e) {
    this.isVisible = e && e.show && e.show.currentValue;
    this.isVisible && this.getTagData();
  }

  getTagData() {
    this.loading = true;
    this.listApi({ noticeCate: this.noticeCate }).subscribe(res => {
      this.loading = false;
      this.data = res.data || [];
      this.cdr.detectChanges();
    });
  }

  tagStChange(e: STChange) {
    switch (e.type) {
      case 'filter':
        this.getTagData();
        break;
      case 'pi':
        this.getTagData();
        break;
      case 'ps':
        this.query.pageSize = e.ps;
        this.getTagData();
        break;
    }
  }

  addOrEditTag(tpl: TemplateRef<{}>, type: 'add' | 'edit') {
    if (type === 'add') {
      this.agoName = undefined;
    }
    this.modalSrv.create({
      nzTitle: type === 'add' ? '新增标签' : '编辑标签',
      nzContent: tpl,
      nzWidth: 400,
      nzOnOk: () => {
        if (this.checkTagValid()) {
          return new Promise(resolve => {
            this.saveApi({
              ...this.selectedRow,
              agoName: this.agoName,
              noticeCate: this.noticeCate,
            }).subscribe(res => {
              if (res.code === '0') {
                resolve();
                this.agoName = '';
                this.getTagData();
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
    const { name } = this.selectedRow;
    if (!name) {
      this.msg.info('请输入标签名称');
      return false;
    }
    return true;
  }

  deleteTag() {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.deleteApi({ id: this.selectedRow.id, name: this.selectedRow.name }).subscribe(() => {
          this.getTagData();
          this.tagSt.clearCheck();
        });
      },
    });
  }

  handleClose(): void {
    this.isVisible = false;
    this.close.emit();
  }
}

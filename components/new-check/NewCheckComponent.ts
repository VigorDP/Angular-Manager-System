// @ts-nocheck
import { Component, EventEmitter, OnInit, Input, Output, OnChanges } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { AllowList } from '../../interfaces';

@Component({
  selector: 'app-new-check',
  templateUrl: './new-check.html',
  styles: [],
})
export class NewCheckComponent implements OnChanges {
  @Input() show = false;
  // 确定事件
  @Output() public save = new EventEmitter<any>();
  @Output() public cancel = new EventEmitter<any>();
  ownerData = {} as any;
  AllowList = AllowList;
  isVisible = true;
  title = '审核';

  constructor(private messageService: NzMessageService) {}

  ngOnChanges(e) {
    this.isVisible = e.show.currentValue;
  }

  handleOk(): void {
    const { flag, checkReason } = this.ownerData;
    const body: any = {
      passed: flag,
      reason: checkReason,
    };
    if (this.isValid()) {
      this.save.emit(body);
    }
  }

  handleCancel(): void {
    this.cancel.emit();
  }

  private isValid(): boolean {
    const { flag, checkReason } = this.ownerData;
    if (flag === null || flag === undefined) {
      this.messageService.info('请选择审核结果');
      return;
    }
    if (!checkReason && flag === false) {
      this.messageService.info('请输入不通过原因');
      return;
    }
    return true;
  }
}

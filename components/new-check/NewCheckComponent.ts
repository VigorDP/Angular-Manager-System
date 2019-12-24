// @ts-nocheck
import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { AllowList } from '../../interfaces';

@Component({
  selector: 'new-check',
  templateUrl: './new-check.html',
  styles: [],
})
export class NewCheckComponent implements OnInit {
  // 关闭事件
  @Output() public close = new EventEmitter<any>();
  // 确定事件
  @Output() public save = new EventEmitter<any>();
  ownerData = {} as any;
  AllowList = AllowList;
  isVisible = true;
  title = '审核';

  constructor(private messageService: NzMessageService) {}

  ngOnInit(): void {
    this.isVisible = true;
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
    this.isVisible = false;
    this.close.emit();
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

// @ts-nocheck
import { Component, EventEmitter, OnInit, Input, Output, OnChanges } from '@angular/core';
import { UploadFile, NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-img-upload',
  templateUrl: './index.html',
  styles: [],
})
export class ImgUploadComponent implements OnInit, OnChanges {
  @Input() number = 1;
  @Input() inputUrls = [];
  @Input() action = '/hl/manager/uploader/img/upload';
  @Output() public getImgUrl = new EventEmitter<any>();

  showUploadList = {
    showPreviewIcon: true,
    showRemoveIcon: true,
    hidePreviewIconInNonImage: true,
  };

  fileList = [];
  previewImage: string | undefined = '';
  previewVisible = false;

  constructor(private msg: NzMessageService) {}

  ngOnInit() {
    this.number = this.number || 1;
  }

  ngOnChanges() {
    this.fileList = this.inputUrls.filter(Boolean).map((url, key) => ({
      uid: key,
      status: 'done',
      response: {
        link: url,
      },
      url,
    }));
  }

  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  };

  handleUpload(e) {
    if (e.type === 'success' || e.type === 'removed') {
      this.getImgUrl.emit(this.urls);
    } else if (e.type === 'error') {
      this.msg.info('上传失败');
    }
  }

  get urls() {
    return this.fileList.map(file => file.status === 'done' && file.response.data).filter(Boolean);
  }
}

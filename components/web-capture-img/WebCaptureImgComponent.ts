import { Component, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'web-capture-img',
  templateUrl: './web-capture-img.html',
})
export class WebCaptureImgComponent {
  @Output() img: EventEmitter<ElementRef> = new EventEmitter<ElementRef>();
  show = false;
  // 视频对象(全局)
  mediaStream;
  ctx; // canvas 画布
  imageUrl;
  constructor(public messageService: NzMessageService, public element: ElementRef) {}
  @ViewChild('video', { static: true }) video: ElementRef;
  @ViewChild('canvas', { static: true }) canvas: ElementRef;

  initCamera() {
    this.show = true;
    this.openMedia();
  }
  // 初始化摄像头
  private async openMedia() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 150, height: 150 },
      });
      // 获得video摄像头
      this.video.nativeElement.srcObject = this.mediaStream;
      this.video.nativeElement.play();
    } catch (error) {
      this.messageService.error(`摄像头初始化失败：${error}`);
      this.imageUrl = null;
    }
  }

  takePhoto() {
    // 获得Canvas对象
    this.ctx = this.canvas.nativeElement.getContext('2d');
    const dpi = window.devicePixelRatio;
    if (dpi < 2) {
      this.ctx.drawImage(this.video.nativeElement, 0, 0, 300, 300);
    } else {
      this.ctx.drawImage(this.video.nativeElement, 0, 0, 150 * window.devicePixelRatio, 150 * window.devicePixelRatio);
    }
    this.imageUrl = this.canvas.nativeElement.toDataURL('image/jpeg', 1.0);
  }

  closeMedia() {
    this.mediaStream.getTracks()[0].stop();
    this.ctx.clearRect(0, 0, 150 * window.devicePixelRatio, 150 * window.devicePixelRatio);
  }

  handleOk() {
    this.img.emit(this.imageUrl);
    this.handleCancel();
  }

  handleCancel() {
    this.show = false;
    this.closeMedia();
  }
}

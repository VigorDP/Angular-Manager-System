import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';

@Injectable({ providedIn: 'root' })
export class LoaderInterceptor implements HttpInterceptor {
  constructor(public msg: NzMessageService) {}
  private id = null;
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 当请求体中有loading:true或者url里有loading时显示loading
    if (!this.id && ((req.body && req.body.loading) || req.params.get('loading'))) {
      this.id = this.msg.loading('正在请求数据，请稍后...', { nzDuration: 0 }).messageId;
    }
    return next.handle(req).pipe(
      finalize(() => {
        if (this.id) {
          this.msg.remove(this.id);
          this.id = null;
        }
      }),
    );
  }
}

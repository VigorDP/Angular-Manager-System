import { Injectable, Inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  HttpEvent,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({ providedIn: 'root' })
export class ResponseInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    public messageService: NzMessageService,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService,
  ) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 拦截需要传 socialId 的请求
    if (!req.params.get('socialId') && req.params.get('socialIdNeeded')) {
      this.messageService.info('请选择当前社区！');
      return;
    }
    if (req.body && !req.body.socialId && req.body.socialIdNeeded) {
      this.messageService.info('请选择当前社区！');
      return;
    }
    return next.handle(req).pipe(
      tap(
        response => {
          if (response instanceof HttpResponse) {
            if (response.status === 200 && response.body) {
              if (response.body.code !== '0') {
                if (response.body instanceof Blob) {
                  return;
                }
                const message = response.body.msg || '未知错误';
                if (response.body.code === '109') {
                  // token 失效
                  this.tokenService.clear();
                  this.router.navigate([this.tokenService.login_url]);
                }
                // tslint:disable-next-line: no-unused-expression
                this.messageService.error(message);
              } else {
                // this.messageService.success(response.body.msg);
              }
            }
          }
        },
        error => {
          if (error instanceof HttpErrorResponse) {
            if (error.status >= 500) {
              this.messageService.error(`服务器错误 ${error.status} ${error.statusText}`);
            } else if (error.status >= 400 && error.status < 500) {
              this.messageService.error(`客户端错误 ${error.status} ${error.statusText}`);
            }
          }
        },
      ),
    );
  }
}

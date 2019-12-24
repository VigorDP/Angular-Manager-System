import { Component, Inject, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService, _HttpClient } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { RestService } from '@app/service';
@Component({
  selector: 'header-user',
  template: `
    <div
      class="alain-default__nav-item d-flex align-items-center px-sm"
      nz-dropdown
      nzPlacement="bottomRight"
      [nzDropdownMenu]="userMenu"
    >
      <nz-avatar [nzSrc]="settings.user.avatar" nzSize="small" class="mr-sm"></nz-avatar>
      {{ settings.user.name }}
    </div>
    <nz-dropdown-menu #userMenu="nzDropdownMenu">
      <div nz-menu class="width-sm">
        <div nz-menu-item (click)="logout()">
          <i nz-icon nzType="logout" class="mr-sm"></i>
          退出登录
        </div>
      </div>
    </nz-dropdown-menu>

    <ng-template #modalContent>
      <form nz-form se-container labelWidth="90">
        <se label="新密码" col="2">
          <input nz-input [(ngModel)]="newPassword" name="startId" />
        </se>
      </form>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderUserComponent {
  newPassword = '';
  constructor(
    public settings: SettingsService,
    public http: _HttpClient,
    private router: Router,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private api: RestService,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService,
  ) {}

  @ViewChild('modalContent', { static: true })
  tpl: TemplateRef<any>;

  logout() {
    this.api.logout().subscribe(res => {
      this.tokenService.clear();
      this.router.navigateByUrl(this.tokenService.login_url);
    });
  }

  updatePassword() {
    this.modalSrv.create({
      nzTitle: '修改密码',
      nzContent: this.tpl,
      nzOnOk: () => {
        if (!this.newPassword) {
          this.msg.info('请输入新密码');
          return;
        }
        this.http
          .post('/api/customer/save', { id: this.settings.user.id, password: this.newPassword })
          .subscribe(res => {
            if (res.code === 0) {
              this.modalSrv.closeAll();
              this.logout();
            }
          });
      },
    });
  }
}

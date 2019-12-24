/**
 * 进一步对基础模块的导入提炼
 * 有关模块注册指导原则请参考：https://ng-alain.com/docs/module
 */
import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { AlainThemeModule } from '@delon/theme';
import { DelonAuthConfig } from '@delon/auth';

export function delonAuthConfig(): DelonAuthConfig {
  return Object.assign(new DelonAuthConfig(), {
    login_url: '/passport/login',
  });
}
@NgModule({
  imports: [AlainThemeModule.forRoot()],
})
export class DelonModule {
  constructor(@Optional() @SkipSelf() parentModule: DelonModule) {}

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DelonModule,
      providers: [{ provide: DelonAuthConfig, useFactory: delonAuthConfig }],
    };
  }
}

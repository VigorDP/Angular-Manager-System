import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from '@app/service';
import { environment } from '@env/environment';
// layout
import { LayoutDefaultComponent } from '../layout/default/default.component';
import { LayoutPassportComponent } from '../layout/passport/passport.component';

// 登录注册
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterComponent } from './passport/register/register.component';
import { UserRegisterResultComponent } from './passport/register-result/register-result.component';

// 业务页面
import { PersonComponent } from './system/person/index.component';
import { RoleComponent } from './system/role/index.component';

export const COMPONENTS = [
  PersonComponent,
  RoleComponent,
  UserLoginComponent,
  UserRegisterComponent,
  UserRegisterResultComponent,
];
const routes: Routes = [
  {
    path: '',
    component: LayoutDefaultComponent,
    canActivate: [LoginGuard],
    children: [
      { path: '', redirectTo: 'system', pathMatch: 'full' },
      {
        path: 'system',
        children: [
          { path: '', redirectTo: 'person', pathMatch: 'full' },
          { path: 'person', component: PersonComponent, data: { title: '人员管理' } },
          { path: 'role', component: RoleComponent, data: { title: '角色管理' } },
        ],
      },
      {
        path: 'enterprise',
        loadChildren: () => import('./enterprise/enterprise.module').then(m => m.EnterpriseModule),
      },
      {
        path: 'account',
        loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
      },
      {
        path: 'social',
        loadChildren: () => import('./social/social.module').then(m => m.SocialModule),
      },
    ],
  },
  {
    path: 'passport',
    component: LayoutPassportComponent,
    children: [
      { path: 'login', component: UserLoginComponent, data: { title: '登录' } },
      { path: 'register', component: UserRegisterComponent, data: { title: '注册' } },
      {
        path: 'register-result',
        component: UserRegisterResultComponent,
        data: { title: '注册结果' },
      },
    ],
  },
  { path: '**', redirectTo: 'system/person' },
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
      // NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
      // Pls refer to https://ng-alain.com/components/reuse-tab
      scrollPositionRestoration: 'top',
    }),
  ],
  declarations: [...COMPONENTS],
  exports: [RouterModule],
})
export class RoutesModule {}

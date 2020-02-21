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
import { PersonComponent } from './system/account/index.component';
import { RoleComponent } from './system/role/index.component';
import { ArchitectComponent } from './system/architect/index.component';

export const COMPONENTS = [
  PersonComponent,
  RoleComponent,
  ArchitectComponent,
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
          { path: '', redirectTo: 'account', pathMatch: 'full' },
          { path: 'account', component: PersonComponent, data: { title: '物业版-账号管理' } },
          { path: 'role', component: RoleComponent, data: { title: '物业版-角色管理' } },
          { path: 'architect', component: ArchitectComponent, data: { title: '物业版-组织架构' } },
        ],
      },
      {
        path: 'social',
        loadChildren: () => import('./social/social.module').then(m => m.SocialModule),
      },
      {
        path: 'house',
        loadChildren: () => import('./house/house.module').then(m => m.HouseModule),
      },
      {
        path: 'electronic-patrol',
        loadChildren: () => import('./electronic-patrol/patrol.module').then(m => m.PatrolModule),
      },
      {
        path: 'people',
        loadChildren: () => import('./people/people.module').then(m => m.PeopleModule),
      },
      {
        path: 'fee',
        loadChildren: () => import('./fee/fee.module').then(m => m.FeeModule),
      },
      {
        path: 'announce',
        loadChildren: () => import('./announce/announce.module').then(m => m.AnnounceModule),
      },
      {
        path: 'government',
        loadChildren: () => import('./government/government.module').then(m => m.GovernmentModule),
      },
      {
        path: 'other',
        loadChildren: () => import('./other/other.module').then(m => m.OtherModule),
      },
    ],
  },
  {
    path: 'passport',
    component: LayoutPassportComponent,
    children: [
      { path: 'login', component: UserLoginComponent, data: { title: '物业版-登录' } },
      { path: 'register', component: UserRegisterComponent, data: { title: '物业版-注册' } },
      {
        path: 'register-result',
        component: UserRegisterResultComponent,
        data: { title: '物业版-注册结果' },
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

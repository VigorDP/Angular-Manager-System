/*
 * @Description:
 * @Date: 2019-10-18 14:29:07
 * @LastEditors: FYC
 * @Author: FYC
 * @LastEditTime: 2019-10-19 15:08:00
 */
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { LayoutDefaultComponent } from './default/default.component';
import { HeaderComponent } from './default/header/header.component';
import { SidebarComponent } from './default/sidebar/sidebar.component';
import { HeaderUserComponent } from './default/header/components/user.component';

const COMPONENTS = [LayoutDefaultComponent, HeaderComponent, SidebarComponent];

const HEADERCOMPONENTS = [HeaderUserComponent];

// passport
import { LayoutPassportComponent } from './passport/passport.component';
const PASSPORT = [LayoutPassportComponent];

@NgModule({
  imports: [SharedModule],
  declarations: [...COMPONENTS, ...HEADERCOMPONENTS, ...PASSPORT],
  exports: [...COMPONENTS, ...PASSPORT],
})
export class LayoutModule {}

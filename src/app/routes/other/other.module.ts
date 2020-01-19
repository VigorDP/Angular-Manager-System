import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { Routes, RouterModule } from '@angular/router';
import { ActivityComponent } from '@app/routes/other/activity/index.component';
import { ForumComponent } from '@app/routes/other/forum/index.component';
import { SenseComponent } from '@app/routes/other/sense/index.component';
import { VoteComponent } from '@app/routes/other/vote/index.component';
import { ExpressComponent } from '@app/routes/other/express/index.component';
import { RepairComponent } from '@app/routes/other/repair/index.component';

const COMPONENTS = [
  ActivityComponent,
  ForumComponent,
  SenseComponent,
  VoteComponent,
  ExpressComponent,
  RepairComponent,
];

const routes: Routes = [
  { path: '', redirectTo: 'activity', pathMatch: 'full' },
  { path: 'activity', component: ActivityComponent, data: { title: '物业版-社区活动' } },
  { path: 'vote', component: VoteComponent, data: { title: '物业版-投票管理' } },
  { path: 'forum', component: ForumComponent, data: { title: '物业版-论坛管理' } },
  { path: 'sense', component: SenseComponent, data: { title: '物业版-生活小常识' } },
  { path: 'express', component: ExpressComponent, data: { title: '物业版-快递' } },
  { path: 'repair', component: RepairComponent, data: { title: '物业版-报修' } },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [...COMPONENTS],
  exports: [RouterModule],
})
export class OtherModule {}

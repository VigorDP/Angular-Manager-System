import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { Routes, RouterModule } from '@angular/router';
import { QrComponent } from './qr/index.component';
import { PlanComponent } from './plan/index.component';
import { PathComponent } from './path/index.component';
import { RecordComponent } from './record/index.component';
import { PathStatComponent } from './path-stat/index.component';
import { StaffStatComponent } from './staff-stat/index.component';

const COMPONENTS = [QrComponent, PlanComponent, PathComponent, RecordComponent, PathStatComponent, StaffStatComponent];

const routes: Routes = [
  { path: '', redirectTo: 'qr', pathMatch: 'full' },
  { path: 'qr', component: QrComponent, data: { title: '物业版-电子巡更-二维码管理' } },
  { path: 'plan', component: PlanComponent, data: { title: '物业版-电子巡更-巡更计划' } },
  { path: 'path', component: PathComponent, data: { title: '物业版-电子巡更-巡更路线' } },
  { path: 'record', component: RecordComponent, data: { title: '物业版-电子巡更-巡更记录' } },
  { path: 'path-stat', component: PathStatComponent, data: { title: '物业版-电子巡更-巡更路线统计' } },
  { path: 'staff-stat', component: StaffStatComponent, data: { title: '物业版-电子巡更-巡更人员统计' } },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [...COMPONENTS],
  exports: [RouterModule],
})
export class PatrolModule {}

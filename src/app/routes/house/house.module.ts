import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { Routes, RouterModule } from '@angular/router';
import { StructureComponent } from './structure/index.component';
import { UsageComponent } from './usage/index.component';

const COMPONENTS = [StructureComponent, UsageComponent];

const routes: Routes = [
  { path: '', redirectTo: 'usage', pathMatch: 'full' },
  { path: 'usage', component: UsageComponent, data: { title: '户室信息' } },
  { path: 'structure', component: StructureComponent, data: { title: '楼栋信息' } },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [...COMPONENTS],
  exports: [RouterModule],
})
export class HouseModule {}

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { Routes, RouterModule } from '@angular/router';
import { PeopleComponent } from './index/index.component';

const COMPONENTS = [PeopleComponent];

const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  { path: 'index', component: PeopleComponent, data: { title: '物业版-住户管理' } },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [...COMPONENTS],
  exports: [RouterModule],
})
export class PeopleModule {}

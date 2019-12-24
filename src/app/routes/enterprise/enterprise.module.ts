import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { Routes, RouterModule } from '@angular/router';
import { PropertyComponent } from './property/index.component';
import { PropertyGroupComponent } from './property-group/index.component';

const COMPONENTS = [PropertyComponent, PropertyGroupComponent];

const routes: Routes = [
  { path: '', redirectTo: 'property-group', pathMatch: 'full' },
  { path: 'property-group', component: PropertyGroupComponent, data: { title: '物业集团公司' } },
  { path: 'property', component: PropertyComponent, data: { title: '物业公司' } },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [...COMPONENTS],
  exports: [RouterModule],
})
export class EnterpriseModule {}

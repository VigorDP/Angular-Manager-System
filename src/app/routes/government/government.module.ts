import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { Routes, RouterModule } from '@angular/router';
import { GovernmentAffairComponent } from '@app/routes/government/index/index.component';

const COMPONENTS = [GovernmentAffairComponent];

const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  { path: 'index', component: GovernmentAffairComponent, data: { title: '物业版-政务管理' } },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [...COMPONENTS],
  exports: [RouterModule],
})
export class GovernmentModule {}

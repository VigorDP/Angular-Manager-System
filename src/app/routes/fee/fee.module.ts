import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { Routes, RouterModule } from '@angular/router';
import { FeeOfflineComponent } from '@app/routes/fee/fee-offline/index.component';
import { FeeStandardComponent } from '@app/routes/fee/fee-standard/index.component';

const COMPONENTS = [FeeOfflineComponent, FeeStandardComponent];

const routes: Routes = [
  { path: '', redirectTo: 'offline', pathMatch: 'full' },
  { path: 'offline', component: FeeOfflineComponent, data: { title: '线下缴费' } },
  { path: 'standard', component: FeeStandardComponent, data: { title: '物业费用标准设置' } },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [...COMPONENTS],
  exports: [RouterModule],
})
export class FeeModule {
}

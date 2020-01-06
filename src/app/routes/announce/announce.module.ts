import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { Routes, RouterModule } from '@angular/router';
import { CommunityAnnounceComponent } from '@app/routes/announce/community-announce/index.component';
import { PoliceSentimentComponent } from '@app/routes/announce/police-sentiment/index.component';
import { PeopleSentimentComponent } from '@app/routes/announce/people-sentiment/index.component';
import { CommunityInfoComponent } from '@app/routes/announce/community-info/index.component';

const COMPONENTS = [CommunityAnnounceComponent, PoliceSentimentComponent, PeopleSentimentComponent, CommunityInfoComponent];

const routes: Routes = [
  { path: '', redirectTo: 'community-announce', pathMatch: 'full' },
  { path: 'community-announce', component: CommunityAnnounceComponent, data: { title: '物业版-社区公告管理' } },
  { path: 'police-sentiment', component: PoliceSentimentComponent, data: { title: '物业版-警情推送' } },
  { path: 'people-sentiment', component: PeopleSentimentComponent, data: { title: '物业版-民情互动' } },
  { path: 'community-info', component: CommunityInfoComponent, data: { title: '物业版-社区咨询管理' } },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [...COMPONENTS],
  exports: [RouterModule],
})
export class AnnounceModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// delon
import { AlainThemeModule } from '@delon/theme';
import { DelonABCModule } from '@delon/abc';
import { DelonAuthModule } from '@delon/auth';
import { DelonFormModule } from '@delon/form';

// third libs
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CountdownModule } from 'ngx-countdown';

// 富文本编辑器
import { NgxTinymceModule } from 'ngx-tinymce';
// 高德地图
import { NgxAmapModule } from 'ngx-amap';

const THIRDMODULES = [NgZorroAntdModule, CountdownModule];

// your componets & directives
import { ImgUploadComponent, NewCheckComponent, WebCaptureImgComponent, CommunityListComponent } from '@app/common';
const COMPONENTS = [ImgUploadComponent, NewCheckComponent, WebCaptureImgComponent, CommunityListComponent];
const DIRECTIVES = [];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    AlainThemeModule.forChild(),
    DelonABCModule,
    DelonFormModule,
    DelonAuthModule,
    // third libs
    ...THIRDMODULES,
    NgxTinymceModule.forRoot({
      baseURL: '//cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.0/',
    }),
    NgxAmapModule.forRoot({
      apiKey: '675e7dbafe451706cc985fef13d8364e',
    }),
  ],
  declarations: [
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AlainThemeModule,
    DelonABCModule,
    DelonFormModule,
    DelonAuthModule,
    // third libs
    ...THIRDMODULES,
    NgxTinymceModule,
    NgxAmapModule,
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
})
export class SharedModule {}

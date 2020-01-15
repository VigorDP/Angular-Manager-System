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
import {
  ImgUploadComponent,
  NewCheckComponent,
  WebCaptureImgComponent,
  TagManagerComponent,
  DropdownTableComponent,
} from '@app/common';
const COMPONENTS = [
  ImgUploadComponent,
  NewCheckComponent,
  WebCaptureImgComponent,
  TagManagerComponent,
  DropdownTableComponent,
];
const DIRECTIVES = [];

export function customUpload(blobInfo, success, failure) {
  let xhr: XMLHttpRequest;
  let formData: FormData;
  xhr = new XMLHttpRequest();
  xhr.withCredentials = false;
  xhr.open('POST', '/hl/social/uploader/img/upload');
  xhr.onload = () => {
    let json;
    if (xhr.status !== 200) {
      failure('HTTP Error: ' + xhr.status);
      return;
    }
    json = JSON.parse(xhr.responseText);
    if (!json || typeof json.data !== 'string') {
      failure('Invalid JSON: ' + xhr.responseText);
      return;
    }
    success(json.data);
  };
  formData = new FormData();
  formData.append('file', blobInfo.blob(), blobInfo.filename());
  xhr.send(formData);
}
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
      baseURL: '../../assets/js/tinymce/',
      config: {
        language: 'zh_CN',
        menubar: false,
        plugins: [
          'advlist link image lists preview hr anchor pagebreak',
          'searchreplace wordcount  fullscreen insertdatetime media',
          'table emoticons  paste',
        ],
        toolbar1:
          'bold italic underline | alignleft aligncenter alignright alignjustify | fullscreen | bullist numlist | outdent indent blockquote | link image media | insertdatetime preview | forecolor backcolor | formatselect fontselect fontsizeselect',
        image_title: false,
        images_upload_credentials: true,
        images_upload_handler: customUpload,
      },
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

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SettingsService } from '@delon/theme';
import { RestService } from '@app/service';

@Component({
  selector: 'layout-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  searchToggleStatus: boolean;
  config = {
    title: '社区列表',
    placeholder: '请输入社区名称',
    api: this.api.getSocialProjectList,
    renderItem: row => row.socialName,
    renderTitle: row => row.socialName,
    propertyCompanyId: this.settings.user.propertyCompanyId,
  };
  constructor(public settings: SettingsService, public api: RestService) {}

  toggleCollapsedSidebar() {
    this.settings.setLayout('collapsed', !this.settings.layout.collapsed);
  }

  searchToggleChange() {
    this.searchToggleStatus = !this.searchToggleStatus;
  }
}

import { Component, ComponentFactoryResolver, OnInit, OnDestroy, ElementRef, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  Router,
  NavigationEnd,
  RouteConfigLoadStart,
  RouteConfigLoadEnd,
  NavigationError,
  NavigationCancel,
} from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { updateHostClass } from '@delon/util';
import { SettingsService, MenuService } from '@delon/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { menus } from '@app/routes/menu';
import { cloneDeep } from 'lodash';
import { RestService } from '@app/service';
import { getFilterMenus } from '@app/common';
@Component({
  selector: 'layout-default',
  templateUrl: './default.component.html',
})
export class LayoutDefaultComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  isFetching = false;

  constructor(
    router: Router,
    _message: NzMessageService,
    private settings: SettingsService,
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private doc: any,
    private menuSrv: MenuService,
    private api: RestService,
  ) {
    // scroll to top in change page
    router.events.pipe(takeUntil(this.unsubscribe$)).subscribe(evt => {
      if (!this.isFetching && evt instanceof RouteConfigLoadStart) {
        this.isFetching = true;
      }
      if (evt instanceof NavigationError || evt instanceof NavigationCancel) {
        this.isFetching = false;
        if (evt instanceof NavigationError) {
          _message.error(`无法加载${evt.url}路由`, { nzDuration: 1000 * 3 });
        }
        return;
      }
      if (!(evt instanceof NavigationEnd || evt instanceof RouteConfigLoadEnd)) {
        return;
      }
      if (this.isFetching) {
        setTimeout(() => {
          this.isFetching = false;
        }, 100);
      }
    });
  }

  private setClass() {
    const { el, doc, renderer, settings } = this;
    const layout = settings.layout;
    updateHostClass(el.nativeElement, renderer, {
      ['alain-default']: true,
      [`alain-default__fixed`]: layout.fixed,
      [`alain-default__collapsed`]: layout.collapsed,
    });

    doc.body.classList[layout.colorWeak ? 'add' : 'remove']('color-weak');
  }

  private setMenu() {
    const backupMenus = cloneDeep(menus);
    const { role = '', ramId = '' } = this.settings.user || {};
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      this.menuSrv.add(backupMenus);
      return;
    }
    this.api.getRoleInfo({ id: ramId }).subscribe(res => {
      const ALLOW_MENU_NAMES = res.data.modules.map(module => module.name);
      const finalMenus = getFilterMenus(backupMenus[0].children, ALLOW_MENU_NAMES);
      backupMenus[0].children = finalMenus;
      this.menuSrv.add(backupMenus);
    });
  }

  ngOnInit() {
    const { settings, unsubscribe$ } = this;
    settings.notify.pipe(takeUntil(unsubscribe$)).subscribe(() => this.setClass());
    this.setClass();
    this.setMenu();
  }

  ngOnDestroy() {
    const { unsubscribe$ } = this;
    unsubscribe$.next();
    unsubscribe$.complete();
  }
}

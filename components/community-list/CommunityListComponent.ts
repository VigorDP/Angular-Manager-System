import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { SettingsService } from '@delon/theme';
import { PageResult, CommunityVo } from '../../interfaces';

@Component({
  selector: 'community-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="position: relative;display: inline-block" *ngIf="communityPageResult">
      <div class="item" (click)="showDropdown()">
        <span>{{ this.settings.app.community.socialName }}</span
        >&nbsp;
        <i nz-icon nzType="down-square" nzTheme="outline"></i>
      </div>
      <nz-modal
        [nzStyle]="{ position: 'absolute', top: '50px', left: '250px', padding: '20px' }"
        [(nzVisible)]="hideDropdown"
        nzTitle="社区列表"
        [nzFooter]="null"
        (nzOnCancel)="cancel()"
      >
        <nz-input-group [nzSuffix]="suffixIconSearch">
          <input
            type="text"
            nz-input
            placeholder="输入小区名称"
            [(ngModel)]="searchText"
            (input)="handleSearch($event)"
          />
        </nz-input-group>
        <ng-template #suffixIconSearch>
          <i nz-icon type="search"></i>
        </ng-template>
        <nz-list
          [nzLoading]="listLoading"
          [nzDataSource]="communityPageResult.rows"
          [nzRenderItem]="item"
          [nzItemLayout]="'horizontal'"
        >
          <ng-template #item let-item>
            <nz-list-item class="point wd-wide auto-space" (click)="handleCommunityChange(item)">
              {{ item.socialName }}
            </nz-list-item>
          </ng-template>
        </nz-list>
        <div style="display: flex;justify-content: space-around">
          <nz-pagination
            [nzPageIndex]="communityPageResult.pageNo"
            [nzPageSize]="communityPageResult.pageSize"
            [nzTotal]="communityPageResult.total"
            [nzSize]="'small'"
            (nzPageIndexChange)="handlePageChange($event)"
          ></nz-pagination>
        </div>
      </nz-modal>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .auto-space {
        word-break: break-all;
        word-wrap: break-word;
      }
    `,
  ],
})
export class CommunityListComponent implements OnInit {
  @Input() api;
  communityPageResult: PageResult<CommunityVo> = null;
  listLoading = false;
  hideDropdown = false;
  searchChange$ = new BehaviorSubject('');
  searchText = '';

  private pageNo = 1;
  private pageSize = 10;

  constructor(public settings: SettingsService, public msg: NzMessageService, private cdr: ChangeDetectorRef) {}

  public ngOnInit() {
    this.getSocialProjectList(this.pageNo, this.pageSize, '');
    this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.getSocialProjectList(1, 10, this.searchText);
      });
    this.settings.notify.subscribe(res => {
      if (res.value.event === 'SOCIAL_CHANGED') {
        this.getSocialProjectList(this.pageNo, this.pageSize, '');
      }
    });
  }

  public showDropdown() {
    this.hideDropdown = !this.hideDropdown;
    if (this.searchText || this.searchText.length > 0) {
      this.searchText = '';
      this.getSocialProjectList(1, 10, '');
    }
  }

  /**
   * 获取社区列表
   */
  public getSocialProjectList(pageNo: number, pageSize: number, searchText: string) {
    const vm = this;
    const body: any = {
      pageNo,
      pageSize,
      name: searchText,
      propertyCompanyId: this.settings.user.propertyCompanyId,
    };

    vm.listLoading = true;
    this.api
      .getSocialProjectList(body)
      .toPromise()
      .then(res => {
        vm.listLoading = false;
        if (res == null || res.code !== '0') {
          vm.communityPageResult.pageNo = 1;
          vm.communityPageResult.totalPage = 0;
          vm.communityPageResult.total = 0;
          vm.communityPageResult.rows = [];
          if (res.code !== 108) {
            vm.msg.error(res.message);
          }
          return;
        }
        vm.communityPageResult = res.data;
        // 设置默认社区
        if (!this.settings.app.community) {
          this.settings.setApp({
            ...this.settings.app,
            community: res.data.rows[0],
            event: null,
          });
        } else {
          // 更新社区
          this.settings.setApp({
            ...this.settings.app,
            community: this.updateCommunity(this.settings.app.targetId),
            event: null,
          });
        }
        this.cdr.detectChanges();
      })
      .catch(err => {
        console.error('获取社区列表失败：', err);
        vm.listLoading = false;
      });
  }

  updateCommunity(id) {
    let result = this.communityPageResult.rows.find(community => community.id === id);
    if (!result) {
      result = this.communityPageResult.rows[0];
    }
    return result;
  }

  public handleCommunityChange(item: CommunityVo): void {
    this.settings.setApp({
      ...this.settings.app,
      community: item,
    });
    this.hideDropdown = !this.hideDropdown;
  }

  public handlePageChange(e: any): void {
    this.pageNo = e;
    this.getSocialProjectList(e, 10, this.searchText);
  }

  cancel() {
    this.hideDropdown = false;
  }

  public handleSearch() {
    this.searchChange$.next('');
  }
}

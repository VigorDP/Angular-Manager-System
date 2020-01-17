import { Component, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { SettingsService } from '@delon/theme';
import { IConfig, IPageResult, IRow } from './interface';

@Component({
  selector: 'app-dropdown-table',
  templateUrl: './index.html',
  styles: [],
})
export class DropdownTableComponent implements OnInit {
  @Input() config: IConfig;
  data: IPageResult<IRow> = null;
  listLoading = false;
  hideDropdown = false;
  searchChange$ = new BehaviorSubject('');
  searchText = '';

  private pageNo;
  private pageSize;

  constructor(public settings: SettingsService, public msg: NzMessageService, private cdr: ChangeDetectorRef) {}

  public ngOnInit(): any {
    this.pageNo = this.config.pageNo || 1;
    this.pageSize = this.config.pageSize || 10;
    // 初始化搜索
    this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.getSocialProjectList(1, 10, this.searchText);
      });
    this.settings.notify.subscribe(res => {
      if (res.value.event === 'LIST-CHANGED') {
        this.getSocialProjectList(this.pageNo, this.pageSize, '');
      }
    });
    this.getSocialProjectList(this.pageNo, this.pageSize, '');
  }

  public showDropdown(): any {
    this.hideDropdown = !this.hideDropdown;
    if (this.searchText || this.searchText.length > 0) {
      this.searchText = '';
      this.getSocialProjectList(1, 10, '');
    }
  }

  /**
   * 获取社区列表
   */
  public getSocialProjectList(pageNo: number, pageSize: number, searchText: string): any {
    const bodyOrParams: any = {
      ...this.config,
      pageNo,
      pageSize,
      name: searchText,
    };

    this.listLoading = true;
    this.config
      .api(bodyOrParams)
      .toPromise()
      .then(res => {
        this.listLoading = false;
        if (res == null || res.code !== '0') {
          this.data.pageNo = 1;
          this.data.totalPage = 0;
          this.data.total = 0;
          this.data.rows = [];
          if (res.code !== '108') {
            this.msg.error(res.message);
          }
          return;
        }
        this.data = res.data;
        // 设置默认主体
        if (!this.settings.app.community) {
          this.settings.setApp({
            ...this.settings.app,
            community: res.data.rows[0] || { name: '暂无内容' },
            event: null,
          });
        } else {
          // 更新主体
          this.settings.setApp({
            ...this.settings.app,
            community: this.updateCommunity(this.settings.app.targetId),
            event: null,
          });
        }
        this.cdr.detectChanges();
      })
      .catch(err => {
        console.error('获取列表失败：', err);
        this.listLoading = false;
      });
  }

  updateCommunity(id: number): IRow {
    let result: any = this.data.rows.find(community => community.id === id);
    if (!result) {
      result = this.data.rows[0] || ({ name: '暂无内容' } as any);
    }
    return result;
  }

  public handleCommunityChange(item: IRow): void {
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

  cancel(): any {
    this.hideDropdown = false;
  }

  public handleSearch(): any {
    this.searchChange$.next('');
  }
}

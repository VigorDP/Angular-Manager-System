import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';

import { PageResult } from '../../interfaces';

/**
 *
 * @author : cyl
 * @date : 2018-7-17
 * @description : 小区列表
 * @since: 1.0
 */
@Component({
  selector: 'community-list',
  template: `
    <div style="position: relative;display: inline-block" *ngIf="communityPageResult">
      <div class="item" (click)="showDropdown()">
        <span>{{ this.mainService.community.name }}</span
        >&nbsp;
        <i class="anticon anticon-down-circle-o" style="font-size: 15px"></i>
      </div>
      <nz-modal
        [nzStyle]="{ position: 'absolute', top: '50px', left: '250px', padding: '20px' }"
        [(nzVisible)]="hideDropdown"
        nzTitle="小区列表"
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
              {{ item.name }}
            </nz-list-item>
          </ng-template>
        </nz-list>
        <div style="display: flex;justify-content: space-around">
          <nz-pagination
            *ngIf="communityPageResult.totalPage > 1"
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
  /**
   * 社区列表查询结果集
   */
  public communityPageResult: PageResult<any> = null;

  public listLoading = false;

  /**
   * 隐藏下拉
   * @type {boolean}
   */
  public hideDropdown = false;

  public searchChange$ = new BehaviorSubject('');
  public searchText = '';

  public sub = null;

  constructor(public messageService: NzMessageService, private route: ActivatedRoute) {}

  public ngOnInit() {
    const vm = this;

    this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.getSimpleCommunityList(1, 10, this.searchText);
      });
  }

  public showDropdown() {
    this.hideDropdown = !this.hideDropdown;
    if (this.searchText || this.searchText.length > 0) {
      this.searchText = '';
      this.getSimpleCommunityList(1, 10, '');
    }
  }

  /**
   * 获取社区列表
   * @param {number} pageNo
   * @param {number} pageSize
   */
  public getSimpleCommunityList(pageNo: number, pageSize: number, searchText: string) {
    // const vm = this;
    // const body: any = {
    //   pageNo,
    //   pageSize,
    //   name: searchText,
    // };
    // if (this.authService.hasSuperAdminRole()) {
    //   // do nothing
    // } else {
    //   body.ids = this.mainService.getSocialIdList();
    // }
    // vm.listLoading = true;
    // console.log(this.authService.user.id);
    // // this.authService.user.id
    // this.restService
    //   .getSimpleCommunityList(body)
    //   .toPromise()
    //   .then(res => {
    //     vm.listLoading = false;
    //     if (res == null || res.code !== 0) {
    //       vm.communityPageResult.pageNo = 1;
    //       vm.communityPageResult.totalPage = 0;
    //       vm.communityPageResult.total = 0;
    //       vm.communityPageResult.rows = [];
    //       console.error('获取所有企业简单信息列表失败：', res.message);
    //       if (res.code !== 108) {
    //         vm.messageService.error(res.message);
    //       }
    //       return;
    //     }
    //     vm.communityPageResult = res.data;
    //     if (_.isEmpty(vm.mainService.community)) {
    //       vm.mainService.setCurrentCommunity(vm.communityPageResult.rows[0], this.getActivatedComponent());
    //     }
    //   })
    //   .catch(err => {
    //     console.error('获取所有小区简单信息列表失败：', err);
    //     vm.listLoading = false;
    //   });
  }

  /**
   * 改变当前小区
   * @param {CommunityVo} item
   */
  public handleCommunityChange(item): void {
    this.hideDropdown = !this.hideDropdown;
  }

  public handlePageChange(e: any): void {
    // this.pageNo = e;
    this.getSimpleCommunityList(e, 10, this.searchText);
  }

  /**
   * 获取当前路由对应的组件
   * @returns {any}
   */
  private getActivatedComponent(): any {
    let component: any = null;
    let temp: any = this.route.children;
    let children: any = null;
    while (temp != null && temp.length > 0) {
      temp = temp[0].children;
      if (temp != null && temp.length > 0) {
        children = temp;
      }
    }
    if (children != null) {
      component = children[0].component;
    }
    return component;
  }

  cancel() {
    this.hideDropdown = false;
  }

  public handleSearch() {
    this.searchChange$.next('');
  }
}

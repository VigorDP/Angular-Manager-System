幸福生活物业集团前端

- 安装 

Node.js >= 10.9

- 开发

```
npm i
git remote add -f common git@code.aliyun.com:happy-life/hl-common-frontend.git
git subtree pull --prefix=src/app/common common prod --squash
npm start
```
- 打包

```
npm run build
```
### 技术栈

- Angular8
- Ng-Alain
- Ng-Zorro
- Ngx-Tinymce 富文本
- Ngx-Amap 高德地图

### 注意

本项目使用了 git subtree 命令,用于集成前端公共模块

```javascript
// 命名远端仓库为 common
git remote add common git@code.aliyun.com:happy-life/hl-common-frontend.git
// 添加公共模块 common 到 src/app/common 目录下,并使用 common 仓库的 prod 分支
git subtree add --prefix=src/app/common common prod --squash
// 从子仓库拉取更新
git subtree pull --prefix=src/app/common common prod --squash
// 推送更新到子仓库
git subtree push --prefix=src/app/common common prod

git subtree split -P src/app/common
```

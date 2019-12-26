import { Menu } from '@delon/theme';

export const getFilterMenus = (menus: Menu[], names: string[]) => {
  markMenuByName(menus, names);
  traverseMenu(menus);
  return menus;
};
// 根据 menu.name===name 将菜单标记为是否显示
function markMenuByName(menus: Menu[], names: string[]) {
  names.forEach(name => {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < menus.length; i++) {
      const menu = menus[i];
      if (menu.name === name) {
        menu.show = true;
        break;
      }
      if (menu.children) {
        markMenuByName(menu.children, [name]);
      }
    }
  });
}
// 取出 menu.show 为 true 的菜单
function traverseMenu(menus: Menu[]) {
  // tslint:disable-next-line: prefer-for-of
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i];
    if (menu.children.length) {
      traverseMenu(menu.children);
    }
    if (!menu.show && menu.children.length === 0) {
      menus.splice(i, 1);
      i--;
      continue;
    }
  }
}

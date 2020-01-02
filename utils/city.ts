import { provinces } from '../constants';

// 获取城市或者区县
export const getCityOrAreaListByCode = (firstCode: string, secondCode?: string) => {
  if (secondCode) {
    return provinces
      .find(province => province.code === firstCode)
      .subProvinces.find(province => province.code === secondCode)
      .subProvinces.map(province => ({ value: province.code, label: province.name }));
  } else {
    return provinces
      .find(province => province.code === firstCode)
      .subProvinces.map(province => ({ value: province.code, label: province.name }));
  }
};

export const getNameByCode = code => {
  function traverse(provinces) {
    for (const item of provinces) {
      if (item.code === code) {
        return item.name;
      } else {
        return traverse(item.subProvinces || []);
      }
    }
  }
  return traverse(provinces);
};

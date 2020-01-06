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
  function traverse(province) {
    if (province.code === code) {
      return province.name;
    } else {
      province.subProvinces = province.subProvinces || [];
      for (const item of province.subProvinces) {
        const name = traverse(item);
        if (name) {
          return name;
        }
      }
    }
  }
  for (const item of provinces) {
    const result = traverse(item);
    if (result) {
      return result;
    }
  }
};

/**
 * Nation
 * @author cyl
 * @date 2018/7/17 下午5:20
 * @description 民族
 */
export enum NationEnum {
  HAN = 1,
  ZHUANG = 2,
  MANCHU = 3,
  HUI = 4,
  MIAO = 5,
  UYGHUR = 6,
  YI = 7,
  TUJIA = 8,
  MONGOL = 9,
  TIBETAN = 10,
  BUYEI = 11,
  DONG = 12,
  YAO = 13,
  KOREAN = 14,
  BAI = 15,
  HANI = 16,
  LI = 17,
  KAZAK = 18,
  DAI = 19,
  SHE = 20,
  LISU = 21,
  GELAO = 22,
  LAHU = 23,
  DONGXIANG = 24,
  VA = 25,
  SUI = 26,
  NAXI = 27,
  QIANG = 28,
  TU = 29,
  XIBE = 30,
  MULAO = 31,
  KIRGIZ = 32,
  DAUR = 33,
  JINGPO = 34,
  SALAR = 35,
  BLANG = 36,
  MAONAN = 37,
  TAJIK = 38,
  PUMI = 39,
  ACHANG = 40,
  NU = 41,
  EWENKI = 42,
  GIN = 43,
  JINO = 44,
  DEANG = 45,
  UZBEK = 46,
  RUSSIANS = 47,
  YUGUR = 48,
  BONAN = 49,
  MONBA = 50,
  OROQEN = 51,
  DERUNG = 52,
  TATAR = 53,
  HEZHEN = 54,
  LHOBA = 55,
  GAOSHAN = 56,
}

export class NationUtil {
  static toString(type: NationEnum): string {
    return NationEnum[type];
  }

  static parse(type: string): NationEnum {
    return NationEnum[type];
  }

  static getMsg(posCasStatus: string);
  static getMsg(posCasStatus: NationEnum): string;
  static getMsg(posCasStatus: any): string {
    let msg = '未知';
    switch (posCasStatus) {
      case NationEnum.HAN:
      case NationUtil.toString(NationEnum.HAN):
        msg = '汉族';
        break;
      case NationEnum.ZHUANG:
      case NationUtil.toString(NationEnum.ZHUANG):
        msg = '壮族';
        break;
      case NationEnum.MANCHU:
      case NationUtil.toString(NationEnum.MANCHU):
        msg = '满族';
        break;
      case NationEnum.HUI:
      case NationUtil.toString(NationEnum.HUI):
        msg = '回族';
        break;
      case NationEnum.MIAO:
      case NationUtil.toString(NationEnum.MIAO):
        msg = '苗族';
        break;
      case NationEnum.UYGHUR:
      case NationUtil.toString(NationEnum.UYGHUR):
        msg = '维吾尔族';
        break;
      case NationEnum.YI:
      case NationUtil.toString(NationEnum.YI):
        msg = '彝族';
        break;
      case NationEnum.TUJIA:
      case NationUtil.toString(NationEnum.TUJIA):
        msg = '土家族';
        break;
      case NationEnum.MONGOL:
      case NationUtil.toString(NationEnum.MONGOL):
        msg = '蒙古族';
        break;
      case NationEnum.TIBETAN:
      case NationUtil.toString(NationEnum.TIBETAN):
        msg = '藏族';
        break;
      case NationEnum.BUYEI:
      case NationUtil.toString(NationEnum.BUYEI):
        msg = '布依族';
        break;
      case NationEnum.DONG:
      case NationUtil.toString(NationEnum.DONG):
        msg = '侗族';
        break;
      case NationEnum.YAO:
      case NationUtil.toString(NationEnum.YAO):
        msg = '瑶族';
        break;
      case NationEnum.KOREAN:
      case NationUtil.toString(NationEnum.KOREAN):
        msg = '朝鲜族';
        break;
      case NationEnum.BAI:
      case NationUtil.toString(NationEnum.BAI):
        msg = '白族';
        break;
      case NationEnum.HANI:
      case NationUtil.toString(NationEnum.HANI):
        msg = '哈尼族';
        break;
      case NationEnum.LI:
      case NationUtil.toString(NationEnum.LI):
        msg = '黎族';
        break;
      case NationEnum.KAZAK:
      case NationUtil.toString(NationEnum.KAZAK):
        msg = '哈萨克族';
        break;
      case NationEnum.DAI:
      case NationUtil.toString(NationEnum.DAI):
        msg = '傣族';
        break;
      case NationEnum.SHE:
      case NationUtil.toString(NationEnum.SHE):
        msg = '畲族';
        break;
      case NationEnum.LISU:
      case NationUtil.toString(NationEnum.LISU):
        msg = '傈僳族';
        break;
      case NationEnum.GELAO:
      case NationUtil.toString(NationEnum.GELAO):
        msg = '仡佬族';
        break;
      case NationEnum.LAHU:
      case NationUtil.toString(NationEnum.LAHU):
        msg = '拉祜族';
        break;
      case NationEnum.DONGXIANG:
      case NationUtil.toString(NationEnum.DONGXIANG):
        msg = '东乡族';
        break;
      case NationEnum.VA:
      case NationUtil.toString(NationEnum.VA):
        msg = '佤族';
        break;
      case NationEnum.SUI:
      case NationUtil.toString(NationEnum.SUI):
        msg = '水族';
        break;
      case NationEnum.NAXI:
      case NationUtil.toString(NationEnum.NAXI):
        msg = '纳西族';
        break;
      case NationEnum.QIANG:
      case NationUtil.toString(NationEnum.QIANG):
        msg = '羌族';
        break;
      case NationEnum.TU:
      case NationUtil.toString(NationEnum.TU):
        msg = '土族';
        break;
      case NationEnum.XIBE:
      case NationUtil.toString(NationEnum.XIBE):
        msg = '锡伯族';
        break;
      case NationEnum.MULAO:
      case NationUtil.toString(NationEnum.MULAO):
        msg = '仫佬族';
        break;
      case NationEnum.KIRGIZ:
      case NationUtil.toString(NationEnum.KIRGIZ):
        msg = '柯尔克孜族';
        break;
      case NationEnum.DAUR:
      case NationUtil.toString(NationEnum.DAUR):
        msg = '达斡尔族';
        break;
      case NationEnum.JINGPO:
      case NationUtil.toString(NationEnum.JINGPO):
        msg = '景颇族';
        break;
      case NationEnum.SALAR:
      case NationUtil.toString(NationEnum.SALAR):
        msg = '撒拉族';
        break;
      case NationEnum.BLANG:
      case NationUtil.toString(NationEnum.BLANG):
        msg = '布朗族';
        break;
      case NationEnum.MAONAN:
      case NationUtil.toString(NationEnum.MAONAN):
        msg = '毛南族';
        break;
      case NationEnum.TAJIK:
      case NationUtil.toString(NationEnum.TAJIK):
        msg = '塔吉克族';
        break;
      case NationEnum.PUMI:
      case NationUtil.toString(NationEnum.PUMI):
        msg = '普米族';
        break;
      case NationEnum.ACHANG:
      case NationUtil.toString(NationEnum.ACHANG):
        msg = '阿昌族';
        break;
      case NationEnum.NU:
      case NationUtil.toString(NationEnum.NU):
        msg = '怒族';
        break;
      case NationEnum.EWENKI:
      case NationUtil.toString(NationEnum.EWENKI):
        msg = '鄂温克族';
        break;
      case NationEnum.GIN:
      case NationUtil.toString(NationEnum.GIN):
        msg = '京族';
        break;
      case NationEnum.JINO:
      case NationUtil.toString(NationEnum.JINO):
        msg = '基诺族';
        break;
      case NationEnum.DEANG:
      case NationUtil.toString(NationEnum.DEANG):
        msg = '德昂族';
        break;
      case NationEnum.UZBEK:
      case NationUtil.toString(NationEnum.UZBEK):
        msg = '乌孜别克族';
        break;
      case NationEnum.RUSSIANS:
      case NationUtil.toString(NationEnum.RUSSIANS):
        msg = '俄罗斯族';
        break;
      case NationEnum.YUGUR:
      case NationUtil.toString(NationEnum.YUGUR):
        msg = '裕固族';
        break;
      case NationEnum.BONAN:
      case NationUtil.toString(NationEnum.BONAN):
        msg = '保安族';
        break;
      case NationEnum.MONBA:
      case NationUtil.toString(NationEnum.MONBA):
        msg = '门巴族';
        break;
      case NationEnum.OROQEN:
      case NationUtil.toString(NationEnum.OROQEN):
        msg = '鄂伦春族';
        break;
      case NationEnum.DERUNG:
      case NationUtil.toString(NationEnum.DERUNG):
        msg = '独龙族';
        break;
      case NationEnum.TATAR:
      case NationUtil.toString(NationEnum.TATAR):
        msg = '塔塔尔族';
        break;
      case NationEnum.HEZHEN:
      case NationUtil.toString(NationEnum.HEZHEN):
        msg = '赫哲族';
        break;
      case NationEnum.LHOBA:
      case NationUtil.toString(NationEnum.LHOBA):
        msg = '珞巴族';
        break;
      case NationEnum.GAOSHAN:
      case NationUtil.toString(NationEnum.GAOSHAN):
        msg = '高山族';
        break;
      default:
        break;
    }
    return msg;
  }

  /**
   *
   */
  static getNationList(): Array<{ name: string; alias: string }> {
    const arry: Array<{ name: string; alias: string }> = [];
    const keys = Object.keys(NationEnum).filter(k => {
      return typeof NationEnum[k as any] === 'number';
    });
    for (const key of keys) {
      const alias = NationUtil.getMsg(key);
      arry.push({ name: key, alias });
    }
    return arry;
  }
}

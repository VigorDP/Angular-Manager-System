import { Observable } from 'rxjs';
interface IBody {
  pageSize: number;
  pageNo: number;
  [key: string]: any;
}
type IParams = IBody;

export interface IRow {
  id: number;
  name: string;
  [key: string]: any;
}

export interface IPageResult<T> {
  total: number;
  totalPage: number;
  pageSize: number;
  pageNo: number;
  rows: Array<T>;
}

export interface IResult {
  code: string;
  data: IPageResult<IRow>;
  [key: string]: any;
}

export interface IConfig {
  api: (obj: IBody | IParams) => Observable<IResult>;
  [key: string]: any;
}

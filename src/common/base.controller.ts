export class BaseController {
  success<D extends any, T extends Record<string, any>>(
    data?: D,
    message?: string,
    otherData?: T,
  ) {
    const result: {
      status: boolean;
      message: string;
      data?: D;
      [key: string]: any;
    } = {
      status: true,
      message: message || '操作成功',
      data,
    };
    if (data) {
      result.data = data;
    }
    for (const k in otherData) {
      result[k] = otherData[k];
    }
    return result;
  }
}

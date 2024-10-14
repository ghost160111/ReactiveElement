export const proxyObjectCollection: Map<string, any> = new Map<string, any>();

export const setProxy = <T extends object>(target: T, callback: (newValue: any, oldValue: any) => void) => {
  const mutatingArrayMethods = [
    'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort',
    'splice', 'unshift', 'flatMap'
  ];

  const createArrayHandler = (originalArray: any[], callback: (newValue: any, oldValue: any) => void) => {
    return {
      get(target: any[], key: string) {
        const value = target[key];

        if (typeof value === 'function' && mutatingArrayMethods.includes(key)) {
          return (...args: any[]) => {
            const oldArray = [...target];
            const result = Array.prototype[key].apply(target, args);
            callback(target, oldArray);
            return result;
          };
        }

        if (typeof value === 'object' && value !== null) {
          return new Proxy(value, createArrayHandler(value, callback));
        }

        return value;
      },
      set(target: any[], key: string, newValue: any) {
        const oldValue = target[key];

        if (oldValue !== newValue) {
          if (typeof newValue === 'object' && newValue !== null) {
            newValue = new Proxy(newValue, createArrayHandler(newValue, callback));
          }

          target[key] = newValue;
          callback(target, oldValue);
        }

        return true;
      }
    };
  };

  const proxyHandler: ProxyHandler<T> = {
    get(target: T, key: string) {
      const value = target[key];

      if (Array.isArray(value)) {
        return new Proxy(value, createArrayHandler(value, callback));
      }

      if (typeof value === 'object' && value !== null) {
        return new Proxy(value, proxyHandler);
      }

      return value;
    },
    set(target: T, key: string, newValue: any) {
      const oldValue = target[key];

      if (oldValue !== newValue) {
        if (Array.isArray(newValue)) {
          newValue = new Proxy(newValue, createArrayHandler(newValue, callback));
        } else if (typeof newValue === 'object' && newValue !== null) {
          newValue = new Proxy(newValue, proxyHandler);
        }

        target[key] = newValue;
        callback(newValue, oldValue);
      }

      return true;
    }
  };

  const context = new Proxy<T>(target, proxyHandler);
  proxyObjectCollection.set(proxyObjectCollection.size.toString(), context);
  return context;
};

export class ProxyContainer<T extends object> {
  public proxy: T;

  constructor(target: T, callback?: (newValue?: any, oldValue?: any) => void) {
    this.proxy = setProxy<T>(target, callback);
  }
}

declare type Primitive = string | number | boolean | symbol | null | undefined;
declare type ChangeCallback = (oldValue: any, newValue: any) => void;

export default class UniversalWatcher<T> {
  private onChange: ChangeCallback;
  public value: T;

  constructor(target: any, onChange?: ChangeCallback) {
    if (this.onChange) {
      this.onChange = onChange;
    }
    this.value = this.createProxy(target);
  }

  private isPrimitive(value: any): value is Primitive {
    return (
      (typeof value !== "object" || value === null) &&
      typeof value !== "function"
    );
  }

  private createProxy(target: any): any {
    if (this.isPrimitive(target)) {
      return this.createPrimitiveProxy(target);
    } else if (Array.isArray(target) || typeof target === "object") {
      return this.createObjectProxy(target);
    } else {
      throw new Error(`Unsupported target type: ${typeof target}`);
    }
  }

  private createPrimitiveProxy(value: Primitive): any {
    let currentValue = value;
    const handler: ProxyHandler<any> = {
      get: (target, prop) => {
        if (prop === "value") {
          return currentValue;
        }
        return Reflect.get(target, prop);
      },
      set: (target, prop, newValue) => {
        if (prop === "value") {
          const oldValue = currentValue;
          currentValue = newValue;
          this.onChange(oldValue, newValue);
          return true;
        }
        return Reflect.set(target, prop, newValue);
      }
    };

    return new Proxy({ value }, handler);
  }

  private createObjectProxy(target: object): any {
    const handler: ProxyHandler<any> = {
      get: (obj, prop) => {
        const value = obj[prop];
        if (this.isPrimitive(value)) {
          return value;
        }
        return new UniversalWatcher(value, (oldValue, newValue) => {
          this.onChange(oldValue, newValue);
        });
      },
      set: (obj, prop, value) => {
        const oldValue = obj[prop];
        obj[prop] = value;
        this.onChange(oldValue, value);
        return true;
      }
    };

    return new Proxy(target, handler);
  }
}

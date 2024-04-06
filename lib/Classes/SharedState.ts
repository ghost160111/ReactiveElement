export default class SharedState {
  public components: {};

  constructor() {
    this.components = {}
  }

  public setComponent(context: any, name: string): void {
    Object.defineProperty(this.components, name, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: context
    });
  }

  public async getComponent(name: any): Promise<CustomElementConstructor> {
    return new Promise<CustomElementConstructor>((resolve: (value: CustomElementConstructor) => void, reject: (reason?: any) => void): void => {
      const checkComponent = (): void => {
        if (this.components[name] !== undefined) {
          resolve(this.components[name]);
        } else {
          setTimeout(checkComponent);
        }
      }

      checkComponent();
    });
  }
}

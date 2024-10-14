export const BASE_COMPONENT_ERRORS = {
  emptyContext: "Context is empty, enter this context of your component class!"
}

export default abstract class BaseComponent<T_Context> {
  public context: T_Context;

  constructor(context: T_Context) {
    if (!context) {
      throw BASE_COMPONENT_ERRORS.emptyContext;
    }

    this.context = context;
  }
}

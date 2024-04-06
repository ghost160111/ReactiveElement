import BaseComponent from "./BaseComponent";
import {
  IEventMapKey,
  IEventMapKeyList
} from "../Interfaces/Interfaces";

export default class EventHandler extends BaseComponent {
  constructor(context: any) {
    super(context);
  }

  protected eventMapKeyList: IEventMapKeyList[] = [];

  public subscribe(refNodeKey: string | symbol, eventType: keyof HTMLElementEventMap, eventListener: EventListener, ...parameters: any[]): EventHandler {
    let eventListenerReference: EventListener = eventListener.bind(this.context, ...parameters);
    let eventMapKeyOptionsRef = { eventType, refNodeKey, parameters, eventListenerName: eventListener.name };

    this.context.eventHandlers[eventListener.name] = new Map<IEventMapKey, EventListener>();

    this.context.eventHandlers[eventListener.name].set(eventMapKeyOptionsRef, eventListenerReference);
    this.eventMapKeyList.push(eventMapKeyOptionsRef);

    this.context.shadowDOM.refs[refNodeKey].addEventListener(eventType, eventListenerReference);

    return this;
  }

  public unsubscribe(refNodeKey: string | symbol, eventType: keyof HTMLElementEventMap, eventListenerName: string): EventHandler {
    for (const [key, eventListenerRef] of this.context.eventHandlers[eventListenerName]) {
      if (refNodeKey === key["refNodeKey"] && eventType === key["eventType"]) {
        this.context.shadowDOM.refs[refNodeKey].removeEventListener(eventType, eventListenerRef);
      }
    }

    return this;
  }

  public unsubscribeEvents(): void {
    for (let i = 0; i < this.eventMapKeyList.length; ++i) {
      let eventMapKey = this.eventMapKeyList[i];
      this.unsubscribe(eventMapKey.refNodeKey, eventMapKey.eventType, eventMapKey.eventListenerName);
    }
  }
}

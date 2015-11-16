//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'


namespace LightSword.Client.Lib {
  
}

export interface IDispatchReceiver {
  receive: (msg: any, args: any) => void;
}

export class DispatchQueue {
  private _store = new Map<string, IDispatchReceiver[]>()
  
  public register(msg: any, receiver: IDispatchReceiver): boolean {
    let subscribers = <IDispatchReceiver[]>this._store.get(msg);
    if (!subscribers) {
      subscribers = [];
      subscribers.push(receiver);
      this._store.set(msg, subscribers);
      return true;
    }
    
    if (subscribers.contains(receiver)) return false;
    subscribers.push(receiver);
    return true;
  }
  
  public unregister(msg: any, receiver: IDispatchReceiver): boolean {
    let subscribers = <IDispatchReceiver[]>this._store.get(msg);
    if (!subscribers) return false;
    let index = subscribers.indexOf(receiver);
    if (index < 0) return false;
    subscribers.splice(index, 1);
    return true;
  }
  
  public publish(msg: any, things: any): boolean {
    let subscribers = <IDispatchReceiver[]>this._store.get(msg);
    if (!subscribers) return false;
    
    process.nextTick(() => {
      subscribers.forEach(item => item.receive(msg, things));
    });
    
    return true;
  }
  
}

export let defaultQueue = new DispatchQueue();
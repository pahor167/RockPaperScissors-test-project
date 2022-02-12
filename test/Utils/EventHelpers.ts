import { expect } from "chai";
import { Event } from "@ethersproject/contracts"

export function expectEvent(events: Event[] | undefined, eventName: string, ...params: any[]): Event {
    expect(events).not.to.be.null;

    const event = events?.find(e => e.event == eventName);
    params.forEach((value, index) => {
        if (value != event?.args?.[index]) {
            console.log(event);
            throw new Error(`Event: ${eventName} Expected argument on index ${index} value ${JSON.stringify(value)} but received ${JSON.stringify(event?.args?.[index])}`);
        }
    });

    return event as Event;
}
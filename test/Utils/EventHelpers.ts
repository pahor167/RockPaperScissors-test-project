import { expect } from "chai";
import { Event } from "@ethersproject/contracts"

export function expectEvent(events: Event[] | undefined, eventName: string, ...params: any[]) {
    expect(events).not.to.be.null;
    expect(events?.find(e => e.event == eventName
        && params.length === e.args?.length
        && params.forEach((value, index) => {
            if (value != e.args?.[index]) {
                throw new Error(`Expected argument value ${value} but received ${e.args?.[index]}`);
            }
        })));
}
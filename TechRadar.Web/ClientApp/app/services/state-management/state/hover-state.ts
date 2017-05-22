import { Blip } from "../../../models";

export interface IHoverState {
    activeBlip: Blip;
};

export const intitialState: IHoverState = {
    activeBlip: null
};

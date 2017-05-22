import { ActionReducer, Action } from "@ngrx/store";
import { IHoverState, intitialState } from "../state/hover-state";
import { ON_HOVER, OFF_HOVER } from "../actions/hover-state-action";

export const hoverStoreReducer: ActionReducer<IHoverState> =
    (state = intitialState, action: Action) => {
        switch (action.type) {
        case ON_HOVER:
            {
                return { activeBlip: action.payload.activeBlip };
            }

        case OFF_HOVER:
            {
                return { activeBlip: null };
            }

        default:
            {
                return state;
            }
        }
    };
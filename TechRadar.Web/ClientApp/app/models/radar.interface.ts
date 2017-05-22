import { Quadrant } from "./quadrant";
import { Cycle } from "./cycle";

export interface IRadar {
    id: string;
    name: string;
    sized: boolean;
    description: string;

    cycles: Cycle[];
    quadrants: Quadrant[];
}

import { Blip } from './blip';
import { Quadrant } from './quadrant';
import { Cycle } from './cycle';

export interface IRadar {
    id: string;
    name: string;
    group: string;
    description: string;

    cycles: Cycle[];
    quadrants: Quadrant[];
}

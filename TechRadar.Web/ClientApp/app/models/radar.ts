import { Blip } from './blip';
import { Quadrant } from './quadrant';
import { Cycle } from './cycle';

export class Radar {
    id: string;
    code: string;
    name: string;
    description: string;
    quadrants: Quadrant[];
    cycles: Cycle[];
    blips: Blip[];
//    private blipNumber: number;

    constructor(id: string, code: string, name: string, description: string, quadrants?: Quadrant[], cycles?: Cycle[]) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.cycles = cycles;
        this.quadrants = quadrants;
//        this.blipNumber = 0;
    }

    public hasQuadrants() {
        return this.quadrants.length > 0;
    }
}

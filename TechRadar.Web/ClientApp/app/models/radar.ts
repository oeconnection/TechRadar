import { Blip } from './blip';
import { Quadrant } from './quadrant';
import { Cycle } from './cycle';

export class Radar {
    id: string;
    name: string;
    group: string;
    description: string;
    quadrants: Quadrant[];
    cycles: Cycle[];
    blips: Blip[];

    constructor(id: string, name: string, group: string, description: string, quadrants?: Quadrant[], cycles?: Cycle[]) {
        this.id = id;
        this.name = name;
        this.group = group;
        this.description = description;
        this.cycles = cycles;
        this.quadrants = quadrants;
    }

    public hasQuadrants() {
        return this.quadrants.length > 0;
    }
}

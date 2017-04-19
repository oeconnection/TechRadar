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

    public findQuadrantByNumber(quadrantNumber: number) {
        if (!this.hasQuadrants()) return null;

        var list = this.quadrants.filter(quad => quad.quadrantNumber === quadrantNumber);

        if (Array.isArray(list) && list.length > 0) {
            return (list[0]);
        }

        return null;
    }

    public findQuadrantById(id: string) {
        if (!this.hasQuadrants()) return null;

        var list = this.quadrants.filter(quad => quad.id === id);

        if (Array.isArray(list) && list.length > 0) {
            return (list[0]);
        }

        return null;
    }

    public findBlipsByQuadrantId(id: string) {
        if (!this.hasQuadrants()) return null;

        return this.blips.filter(blip => blip.quadrantId === id);
    }

    public findCycleById(id: string): Cycle {
        var list = this.cycles.filter(cycle => cycle.id === id);

        if (Array.isArray(list) && list.length > 0) {
            return (list[0]);
        }

        return null;
    }

}

import { Blip } from './blip';
import { Quadrant } from './quadrant';
import { Cycle } from './cycle';

export class Radar {
    //id: string;
    radarId: string;
    name: string;
    description: string;
    quadrants: Quadrant[];
    cycles: Cycle[];
    private blipNumber: number;

    constructor(radarId: string, name: string, description: string, quadrants?: Quadrant[], cycles?: Cycle[]) {
        this.blipNumber = 0;
        this.radarId = radarId;
        this.name = name;
        this.description = description;
        this.quadrants = quadrants;
        this.cycles = cycles;
    }

    public allBlips() {
        return this.quadrants.reduce(function (blips, quadrant) {
            return blips.concat(quadrant.blips);
        }, []);
    }

    public hasQuadrants() {
        return this.quadrants.length > 0;
    }

    //public cycles(): Array<Cycle> {
    //    let cycleHash, cycleArray;

    //    cycleArray = [];
    //    cycleHash = {};

    //    this.allBlips().forEach(function (blip) {
    //        cycleHash[blip.cycle.name] = blip.cycle;
    //    });

    //    for (let p in cycleHash) {
    //        if (cycleHash.hasOwnProperty(p)) {
    //            cycleArray.push(cycleHash[p]);
    //        }
    //    }

    //    return cycleArray.slice(0).sort(function (a, b) { return a.order - b.order; });
    //};
}

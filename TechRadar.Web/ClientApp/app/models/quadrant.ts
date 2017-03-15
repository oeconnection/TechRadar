import { Blip } from './blip';

export class Quadrant {
    quadrantNumber: number;
    name: string;
    description: string;
    blips: Blip[]

    constructor(quandrantInfo: any) {
        this.quadrantNumber = quandrantInfo.quadrantNumber;
        this.name = quandrantInfo.name;
        this.description = quandrantInfo.description;

        if (Array.isArray(quandrantInfo.blips)) {
            this.blips = quandrantInfo.blips;
        } else {
            this.blips = <Blip[]>[];
        }
    }

    public add(newBlips: any) {
        if (Array.isArray(newBlips)) {
            this.blips = this.blips.concat(newBlips);
        } else {
            this.blips.push(newBlips);
        }
    }
}

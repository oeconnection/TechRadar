import { Blip } from './blip';

export class Quadrant {
    id: string;
    quadrantNumber: number;
    name: string;
    description: string;

    constructor(quandrantInfo: any) {
        this.id = quandrantInfo.id;
        this.quadrantNumber = quandrantInfo.quadrantNumber;
        this.name = quandrantInfo.name;
        this.description = quandrantInfo.description;
    }
}

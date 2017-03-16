import { Cycle } from './cycle';
import moment = require("moment");

export class Blip {
    id: string;
    name: string;
    description: string;
    added: Date;
    size: number;
    quadrantId: string;
    cycleId: string;
    isNew: boolean;

    constructor(id: string, name: string, description: string, size: number, added: Date, cycleId: string, quadrantId: string) {
        this.id = id;

        this.name = name;
        this.description = description ? description : '';
        this.added = added;
        this.size = size ? size : 1;

        this.cycleId = cycleId;
        this.quadrantId = quadrantId;

        var diff = moment(new Date()).diff(moment(this.added), 'months');
        this.isNew = diff <= 3;
    }
}

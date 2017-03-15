import { Cycle } from './cycle';

export class Blip {
    name: string;
    description: string;
    isNew: boolean;
    added: Date;
    cycle: Cycle;
    id: number;
    size: number;

    constructor(id: number, name: string, cycle: Cycle, isNew?: boolean, description?: string, size?: number, added?: Date) {
        this.id = id;

        this.name = name;
        this.cycle = cycle;

        this.description = description ? description : '';
        this.isNew = isNew ? true : false;

        this.size = size ? size : 1;
    }
}

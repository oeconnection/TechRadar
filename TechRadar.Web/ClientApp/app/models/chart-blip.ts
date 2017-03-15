import { Blip } from './';

export class ChartBlip extends Blip {
    shape: { x: number, y: number };
    text: { x: number, y: number };
    cssClass: string;
    style: string;
    opacity: number;

    constructor(blip: Blip, shape: { x: number, y: number }, text: { x: number, y: number }, cssClass: string, opacity: number) {
        super(blip.id, blip.name, blip.cycle, blip.isNew, blip.description, blip.size);

        this.shape = shape;
        this.text = text;
        this.cssClass = cssClass;
        this.style = `'display': 'none'`;
        this.opacity = opacity;
    }

    public points(): string {
        let tsize, top, left, right, bottom, points;

        tsize = 13 + this.size;
        top = this.shape.y - tsize;
        left = (this.shape.x - tsize + 1);
        right = (this.shape.x + tsize + 1);
        bottom = (this.shape.y + tsize - tsize / 2.5);

        return (this.shape.x + 1) + ',' + top + ' ' + left + ',' + bottom + ' ' + right + ',' + bottom;
    }

    public tooltipName(): string {
        return 'tooltip' + this.id;
    } 

    public blipTitle(): string {
        return this.name + ((this.description) ? ': ' + this.description.replace(/(<([^>]+)>)/ig, '') : '');
    } 
}

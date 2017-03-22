import { Quadrant } from './';

export class ChartQuadrant extends Quadrant {
    blipAdjustment: { x: number, y: number };
    center: { x: number, y: number };
    cssClass: string;
    horizontalLine: { x: number, y: number };
    size: number;
    titleAnchor: string;
    titlePosition: { x: number, y: number };
    chartAlignment: string;
    translate: { x: number, y: number };
    verticalLine: { x: number, y: number };

    //private isQuadrantOnly: boolean;
    //private chartCenter: number;
    //private chartRadius: number;

    constructor(config: any) {
        let quadrantInfo = {
            id: config.settings.id,
            quadrantNumber: config.settings.quadrant,
            name: config.settings.name,
            description: config.settings.description,
        }
        super(quadrantInfo);

        //this.isQuadrantOnly = config.settings.isQuadrantOnly;
        //this.chartCenter = config.settings.chartCenter;
        //this.chartRadius = config.settings.chartRadius;
        this.size = config.settings.size;

        this.setProperties(quadrantInfo);
    }

    private setProperties(config: any): void {
        switch (this.quadrantNumber) {
            case 1:
                this.center = { x: this.size, y: this.size };
                this.translate = { x: 1, y: 1 };
                this.verticalLine = { x: this.size - 15, y: 0 };
                this.horizontalLine = { x: 0, y: this.size - 15 };
                this.blipAdjustment = { x: -1, y: -1 };
                this.cssClass = 'first';
                this.titlePosition = { x: 10, y: 10 };
                this.titleAnchor = 'start';
                this.chartAlignment = 'text-right';
                break;

            case 2:
                this.center = { x: 0, y: this.size };
                this.translate = { x: 0, y: 1 };
                this.verticalLine = { x: 0, y: 0 };
                this.horizontalLine = { x: 0, y: this.size - 15 };
                this.blipAdjustment = { x: 1, y: -1 };
                this.cssClass = 'second';
                this.titlePosition = { x: this.size - 10, y: 10 };
                this.titleAnchor = 'end';
                this.chartAlignment = 'text-left';
                break;

            case 3:
                this.center = { x: 0, y: 0 };
                this.translate = { x: 0, y: 0 };
                this.verticalLine = { x: this.size - 15, y: 0 };
                this.horizontalLine = { x: 0, y: 0 };
                this.blipAdjustment = { x: 1, y: 1 };
                this.cssClass = 'third';
                this.titlePosition = { x: this.size - 10, y: this.size - 10 };
                this.titleAnchor = 'end';
                this.chartAlignment = 'text-left';
                break;

            case 4:
                this.center = { x: this.size, y: 0 };
                this.translate = { x: 1, y: 0 };
                this.verticalLine = { x: this.size - 15, y: 0 };
                this.horizontalLine = { x: 0, y: 0 };
                this.blipAdjustment = { x: -1, y: 1 };
                this.cssClass = 'fourth';
                this.titlePosition = { x: 10, y: this.size - 10 };
                this.titleAnchor = 'start';
                this.chartAlignment = 'text-right';
                break;
        }
    }
}

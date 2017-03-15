import { Quadrant, ChartBlip, Blip, ChartCycle } from './';
import Chance = require('chance');

export class ChartQuadrant extends Quadrant {
    blipAdjustment: { x: number, y: number };
    center: { x: number, y: number };
    chartBlips: Array<ChartBlip>;
    cssClass: string;
    horizontalLine: { x: number, y: number };
    size: number;
    titleAnchor: string;
    titlePosition: { x: number, y: number };
    chartAlignment: string;
    translate: { x: number, y: number };
    verticalLine: { x: number, y: number };

    private isQuadrantOnly: boolean;
    private chartCenter: number;
    private chartRadius: number;

    constructor(config: any) {
        let quadrantInfo = {
            quadrantNumber: config.settings.quadrant,
            name: config.settings.name,
            description: config.settings.description,
            blips: null
        }

        if (config.datasets) {
            if (config.datasets.quadrant) {
                quadrantInfo.blips = config.datasets.quadrant.blips;
            }
        }

        super(quadrantInfo);

        this.isQuadrantOnly = config.settings.isQuadrantOnly;
        this.chartCenter = config.settings.chartCenter;
        this.chartRadius = config.settings.chartRadius;
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

    private findCycleByName(cycles: Array<ChartCycle>, name: string): ChartCycle {
        if (Array.isArray(cycles) && cycles.length > 0) {
            var list = cycles.filter(cycle => cycle.name === name);

            if (Array.isArray(list) && list.length > 0) {
                return (list[0]);
            }
        }

        return null;
    }

    public convertBlipToChartBlip(cycles: Array<ChartCycle>): void {
        let chartBlips: Array<ChartBlip>;

        chartBlips = [];

        var maxRadius, minRadius;

        this.blips.forEach((blip: Blip) => {
            var cycle: ChartCycle;

            cycle = this.findCycleByName(cycles, blip.cycle.name);
            maxRadius = cycle.outerRadius;
            minRadius = cycle.innerRadius;

            var angleInRad, radius;

            var split = blip.name.split('');
            var sum = split.reduce((p, c) => { return p + c.charCodeAt(0); }, 0);
            var chance = new Chance(sum * cycle.name.length * blip.id);

            if ((maxRadius - 10) > (minRadius + 25)) {
                maxRadius = maxRadius - 10;
                minRadius = minRadius + 25;
            } else {
                maxRadius = maxRadius - 5;
                minRadius = minRadius + 5;
            }

            angleInRad = Math.PI * chance.integer({ min: 13, max: 85 }) / 180;
            radius = chance.floating({ min: minRadius, max: maxRadius });

            var x: number, y: number;
            if (this.isQuadrantOnly) {
                x = this.center.x + (radius * Math.cos(angleInRad) * this.blipAdjustment.x);
                y = this.center.y + (radius * Math.sin(angleInRad) * this.blipAdjustment.y);
            } else {
                x = this.chartCenter + (radius * Math.cos(angleInRad) * this.blipAdjustment.x);
                y = this.chartCenter + (radius * Math.sin(angleInRad) * this.blipAdjustment.y);
            }

            let chartBlip = new ChartBlip(blip, { x: x, y: y }, { x: (x + 15), y: (y + 4) }, this.cssClass, 1);
            chartBlips.push(chartBlip);
        });

        this.chartBlips = chartBlips;
    };


}

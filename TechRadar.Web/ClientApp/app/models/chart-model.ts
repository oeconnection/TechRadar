import { Cycle, Radar, Quadrant, ChartBlip, ChartCycle, ChartQuadrant, RadarConfig, Blip } from './';
import TinyColor = require('tinycolor2');
import { D3 } from 'd3-ng2-service';
import * as _ from 'underscore';
import Chance = require('chance');


export class ChartModel {
    radar: Radar;
    blips: ChartBlip[];
    isQuadrantOnly: boolean;

    id: string;
    name: string;
    size: number;
    radius: number;
    center: number;
    description: string;

    quadrant: ChartQuadrant;
    quadrants: Array<ChartQuadrant>;
    cycles: Array<ChartCycle>;

    quadrantNumber: number;
    private d3: D3; 

    constructor(config: RadarConfig, d3: D3) {
        this.d3 = d3;
        this.buildModel(config);
    }

    private buildModel(config: RadarConfig) {
        this.radar = config.dataset.radar;
        this.id = this.radar.radarId;
        this.isQuadrantOnly = !(!(config.settings.quadrant));
        this.name = config.settings.name;
        this.description = this.radar.description;
        this.size = config.settings.size;
        this.quadrantNumber = config.settings.quadrant;

        this.quadrants = [];
        if (this.isQuadrantOnly) {
            this.radius = config.settings.size;
            this.center = Math.round(config.settings.size / 2);
        } else {
            this.radius = Math.round(config.settings.size / 2);
            this.center = Math.round(config.settings.size / 2);
        }

        this.addCycles();

        this.addQuadrants();

        this.addBlips(config.dataset.blips);
    }

    private findCycleById(id: string): ChartCycle {
        var list = this.cycles.filter(cycle => _.isEqual(cycle.id, id));

        if (Array.isArray(list) && list.length > 0) {
            return (list[0]);
        }

        return null;
    }

    private findQuadrantById(id: string): ChartQuadrant {
        var list = this.quadrants.filter(quad => _.isEqual(quad.id, id));

        if (Array.isArray(list) && list.length > 0) {
            return (list[0]);
        }

        return null;
    }

    findQuadrantByNumber(number: number): ChartQuadrant {
        var list = this.quadrants.filter(quad => _.isEqual(quad.quadrantNumber, number));

        if (Array.isArray(list) && list.length > 0) {
            return (list[0]);
        }

        return null;
    }

    private sortBlips(a: Blip, b: Blip) {
        let aQuadrant = this.radar.quadrants.find(x => _.isEqual(x.id, a.quadrantId));
        let bQuadrant = this.radar.quadrants.find(x => _.isEqual(x.id, b.quadrantId));

        let aCycle = this.radar.cycles.find(x => _.isEqual(x.id, a.cycleId));
        let bCycle = this.radar.cycles.find(x => _.isEqual(x.id, b.cycleId));

        let nameDiff = 0;
        if (a.name > b.name) nameDiff = 1;
        if (a.name < b.name) nameDiff = -1;

        return aQuadrant.quadrantNumber - bQuadrant.quadrantNumber || aCycle.order - bCycle.order || nameDiff;

    }

    private sortBlipsOBSOLETE(a: Blip, b: Blip) {
        let aQuadrant = this.radar.quadrants.find(x => _.isEqual(x.id, a.quadrantId));
        let bQuadrant = this.radar.quadrants.find(x => _.isEqual(x.id, b.quadrantId));

        console.log("Sorting Quadrants (%s vs %s)", aQuadrant.quadrantNumber, bQuadrant.quadrantNumber);
        if (aQuadrant == null || bQuadrant == null) return 0;

        if (aQuadrant.quadrantNumber < bQuadrant.quadrantNumber) return -1;
        if (aQuadrant.quadrantNumber > bQuadrant.quadrantNumber) return 1;

        // Sort on cycle
        let aCycle = this.radar.cycles.find(x => _.isEqual(x.id, a.cycleId));
        let bCycle = this.radar.cycles.find(x => _.isEqual(x.id, b.cycleId));

        console.log("Sorting Cycles (%s vs %s)", aCycle.order, aCycle.order);
        if (aCycle == null || bCycle == null) return 0;

        if (aCycle.order < aCycle.order) return -1;
        if (aCycle.order > aCycle.order) return 1;

        console.log("Sorting Names (%s vs %s)", a.name, b.name);
        if (a < b) return -1;
        if (a > b) return 1;

        return 0;
    }

    private addBlips(blips: Blip[]): void {
        let chartBlips: Array<ChartBlip>;
        chartBlips = [];

        var maxRadius, minRadius;
        var blipCounter = 0;

        blips.sort((x, y) => this.sortBlips(x, y)).forEach((blip: ChartBlip) => {
            var cycle: ChartCycle,
                quadrant: ChartQuadrant;

            blipCounter++;
            cycle = this.findCycleById(blip.cycleId);
            quadrant = this.findQuadrantById(blip.quadrantId);

//            console.info("Sorting In Loop (# %s | Name: %s | Quad: %s | Cycle: %s )", blipCounter, blip.name, quadrant.quadrantNumber, cycle.order);

            maxRadius = cycle.outerRadius;
            minRadius = cycle.innerRadius;

            var angleInRad, radius;

            var split = blip.name.split('');
            var sum = split.reduce((p, c) => { return p + c.charCodeAt(0); }, 0);
            var chance = new Chance(sum * cycle.name.length * blipCounter);

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
                x = this.quadrant.center.x + (radius * Math.cos(angleInRad) * this.quadrant.blipAdjustment.x);
                y = this.quadrant.center.y + (radius * Math.sin(angleInRad) * this.quadrant.blipAdjustment.y);
            } else {
                x = this.center + (radius * Math.cos(angleInRad) * quadrant.blipAdjustment.x);
                y = this.center + (radius * Math.sin(angleInRad) * quadrant.blipAdjustment.y);
            }

            let chartBlip = new ChartBlip(blip, { x: x, y: y }, { x: (x + 15), y: (y + 4) }, quadrant.cssClass, 1, blipCounter);
            chartBlips.push(chartBlip);
        });

        this.blips = chartBlips;
    };

    private addQuadrants(): void {
        let quadrants: Array<Quadrant>;
        quadrants = [];

        let quadrant: Quadrant;
        quadrants = this.radar.quadrants;

        let quadrantConfig = {
            settings: {
                id: null,
                name: '',
                description: '',
                toolTip: '',
                quadrant: this.quadrantNumber,
                isQuadrantOnly: this.isQuadrantOnly,
                size: this.size,
                chartRadius: this.radius,
                chartCenter: this.center
            },
            datasets: {
                quadrant: quadrant
            }
        };

        if (this.isQuadrantOnly) {
            var list = quadrants.filter(quad => quad.quadrantNumber === this.quadrantNumber);

            if (list && list.length > 0) {
                quadrant = list[0];
            }

            quadrantConfig.settings.id = quadrant.id;
            quadrantConfig.settings.name = quadrant.name;
            quadrantConfig.settings.description = quadrant.description;
            quadrantConfig.settings.quadrant = this.quadrantNumber;
            quadrantConfig.datasets.quadrant = quadrant;

            this.quadrant = new ChartQuadrant(quadrantConfig);
        } else {
            this.radar.quadrants.sort((a, b) => { return a.quadrantNumber - b.quadrantNumber }).forEach((quad) => {
                quadrantConfig.settings.id = quad.id;
                quadrantConfig.settings.name = quad.name;
                quadrantConfig.settings.description = quad.description;
                quadrantConfig.settings.quadrant = quad.quadrantNumber;
                quadrantConfig.datasets.quadrant = quad;

                this.quadrants.push(new ChartQuadrant(quadrantConfig));
            });
        }
    }

    private addCycles() {
        var fill: string;
        var pathContext = this.d3.arc();
        fill = "#a2a2a2";

        this.cycles = new Array<ChartCycle>();

        var cycleTotal = this.radar.cycles.reduce(function (previous, current) {
            return previous + current.size;
        }, 0);

        this.radar.cycles.sort((a, b) => { return a.order - b.order }).forEach((cycle: Cycle, i: number) => {
            let transform: { x: number, y: number };

            if (this.isQuadrantOnly) {
                transform = {
                    x: this.quadrant.translate.x,
                    y: this.quadrant.translate.y
                };
            } else {
                transform = {
                    x: 1,
                    y: 1
                };
            }
            var ringMeasures = this.getRadii(cycle, i, cycleTotal);
            var cycleModel = new ChartCycle({
                pathContext: pathContext,
                cycle: cycle,
                quadrantNumber: this.quadrantNumber,
                quadrant: this.quadrant,
                outerRadius: ringMeasures.outerRadius,
                innerRadius: ringMeasures.innerRadius,
                ringArea: ringMeasures.ringArea,
                fill: fill,
                transform: transform,
                isQuadrantOnly: this.isQuadrantOnly,
                radius: this.radius
            });

            this.cycles.push(cycleModel);

            fill = TinyColor(fill).lighten(7).toString();

        });
    }

    private getRadii(cycle: Cycle, i: number, cycleTotal: number): { outerRadius: number, innerRadius: number, ringArea: number } {
        var previousAreaTotal = 0;
        if (Array.isArray(this.cycles)) {
            var previousAreaTotal = this.cycles.reduce(function (previous, current) {
                return previous + current.ringArea;
            }, 0);
        }

        var cyclePercent = cycle.size / cycleTotal;

        var fullArea = Math.pow(this.radius, 2) * Math.PI;

        var returnValues = { outerRadius: 0.0, innerRadius: 0.0, ringArea: 0.0 };

        returnValues.ringArea = (fullArea * cyclePercent);

        if (i === 0) {
            returnValues.innerRadius = 0;
            returnValues.outerRadius = Math.sqrt(returnValues.ringArea / Math.PI);
        } else {
            returnValues.innerRadius = this.cycles[i - 1].outerRadius; // outer is next inner
            returnValues.outerRadius = Math.sqrt((returnValues.ringArea + previousAreaTotal) / Math.PI);
        }

        return returnValues;
    }

    findBlipsByQuadrantId(id: string): ChartBlip[] {
        return this.blips.filter(blip => _.isEqual(blip.quadrantId, id));
    }
}

import { Cycle, Radar, Quadrant, ChartBlip, ChartCycle, ChartQuadrant, RadarConfig } from './';
import TinyColor = require('tinycolor2');
import { D3 } from 'd3-ng2-service';

export class ChartModel {
    radar: Radar;
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

    private quadrantNumber: number;
    private d3: D3; 

    constructor(config: RadarConfig, d3: D3) {
        this.radar = config.dataset;
        this.quadrantNumber = config.settings.quadrant;
        this.id = config.dataset.radarId;
        this.isQuadrantOnly = !(!(config.settings.quadrant));
        this.d3 = d3;
        this.name = config.settings.name;
        this.description = config.dataset.description;
        this.size = config.settings.size;
        this.quadrants = [];

        if (this.isQuadrantOnly) {
            this.radius = config.settings.size;
            this.center = Math.round(config.settings.size / 2);
        } else {
            this.radius = Math.round(config.settings.size / 2);
            this.center = Math.round(config.settings.size / 2);
        }

        this.addQuadrants();

        if (config.dataset) {
            var cycles = config.dataset.cycles;
            if (Array.isArray(cycles)) {
                this.addCycles(cycles);
            }
        }

        this.addBlipsToQuadrants();
    }

    private addQuadrants(): void {
        let quadrants: Array<Quadrant>;
        quadrants = [];

        let quadrant: Quadrant;

        if (this.radar) {
            if (this.radar.quadrants && this.radar.quadrants.length > 0) {
                quadrants = this.radar.quadrants;
            }
        }

        let quadrantConfig = {
            settings: {
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

            quadrantConfig.settings.name = quadrant.name;
            quadrantConfig.settings.description = quadrant.description;
            quadrantConfig.settings.quadrant = this.quadrantNumber;
            quadrantConfig.datasets.quadrant = quadrant;

            this.quadrant = new ChartQuadrant(quadrantConfig);
        } else {
            this.radar.quadrants.sort((a, b) => { return a.quadrantNumber - b.quadrantNumber }).forEach((quad) => {
                quadrantConfig.settings.name = quad.name;
                quadrantConfig.settings.description = quad.description;
                quadrantConfig.settings.quadrant = quad.quadrantNumber;
                quadrantConfig.datasets.quadrant = quad;

                this.quadrants.push(new ChartQuadrant(quadrantConfig));
            });
        }
    }

    private addBlipsToQuadrants(): void {
        if (this.isQuadrantOnly) {
            this.quadrant.convertBlipToChartBlip(this.cycles);
        } else {
            this.quadrants.sort((a, b) => { return a.quadrantNumber - b.quadrantNumber }).forEach((quad) => {
                quad.convertBlipToChartBlip(this.cycles);
            });
        }
    }

    private addCycles(cycles: Cycle[]) {
        var fill: string;
        var pathContext = this.d3.arc();
        fill = "#a2a2a2";

        this.cycles = new Array<ChartCycle>();

        var cycleTotal = cycles.reduce(function (previous, current) {
            return previous + current.size;
        }, 0);

        cycles.sort((a, b) => { return a.order - b.order }).forEach((cycle: Cycle, i: number) => {
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
            var vm = new ChartCycle({
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

            this.cycles.push(vm);

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

    public allBlips(): Array<ChartBlip> {
        if (this.isQuadrantOnly) {
            return this.quadrant.chartBlips;
        } else {
            let blips: Array<ChartBlip>;
            blips = [];
            this.quadrants.sort((a, b) => { return a.quadrantNumber - b.quadrantNumber }).forEach((quad) => {
                blips = blips.concat(quad.chartBlips);
            });
            return blips;
        }
    }

    public getQuadrant(quadrantNumber: number): ChartQuadrant {
        if (Array.isArray(this.quadrants) && this.quadrants.length > 0) {
            var list = this.quadrants.filter(quad => quad.quadrantNumber === quadrantNumber);

            if (Array.isArray(list) && list.length > 0) {
                return (list[0]);
            }
        }

        return null;
    }
}

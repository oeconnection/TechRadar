import { Cycle, ChartQuadrant } from './';

export class ChartCycle extends Cycle {
    quadrantNumber: number;
    outerRadius: number;
    innerRadius: number;
    ringArea: number;
    path: string;
    fill: string;
    transform: { x: number, y: number };
    centerOfRing: { x: number, y: number };
    quadrant: ChartQuadrant;

    private isQuadrantOnly: boolean;
    private radius: number;
    private pathContext: any;
    private transformationBase: { x: number, y: number };

    constructor(cycleInfo: any) {
        super({
            id: cycleInfo.cycle.id,
            name: cycleInfo.cycle.name,
            fullName: cycleInfo.cycle.fullName,
            description: cycleInfo.cycle.description,
            order: cycleInfo.cycle.order,
            size: cycleInfo.cycle.size
        });
        this.transformationBase = cycleInfo.transform;
        this.pathContext = cycleInfo.pathContext;
        this.quadrantNumber = cycleInfo.quadrantNumber;
        this.quadrant = cycleInfo.quadrant;
        this.outerRadius = cycleInfo.outerRadius;
        this.innerRadius = cycleInfo.innerRadius;
        this.ringArea = cycleInfo.ringArea;
        this.fill = cycleInfo.fill;
        this.isQuadrantOnly = cycleInfo.isQuadrantOnly;
        this.radius = cycleInfo.radius;

        this.buildCircle();
    }

    private buildCircle() {
        let radianCalculation: number;
        let startRadian: number,
            endRadian: number,
            lineY: number;

        if (this.isQuadrantOnly) {
            radianCalculation = (0.5 * (this.quadrantNumber - 1));
            startRadian = ((radianCalculation - 0.5) * Math.PI);
            endRadian = (radianCalculation * Math.PI);
            lineY = this.quadrant.horizontalLine.y;
        } else {
            startRadian = -0.5 * Math.PI;
            endRadian = 1.5 * Math.PI;
            lineY = this.radius;
        }

        let arc = this.pathContext
            .innerRadius(this.innerRadius)
            .outerRadius(this.outerRadius)
            .startAngle(startRadian)
            .endAngle(endRadian);

        let transformX = this.transformationBase.x * this.radius;
        let transformY = this.transformationBase.y * this.radius;
        let textStart = Math.abs((this.radius - this.outerRadius) + ((this.outerRadius - this.innerRadius) / 2));

        this.path = arc();
        this.centerOfRing = {
            x: textStart,
            y: lineY + 10
        };
        this.transform = {
            x: transformX,
            y: transformY
        }
    }

    public transformString(): string {
        return 'translate(' + this.transform.x.toString() + ', ' + this.transform.y.toString() + ')';
    }
}

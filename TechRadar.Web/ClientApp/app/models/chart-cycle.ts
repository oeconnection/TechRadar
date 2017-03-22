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
    lineY: number;
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
        this.lineY = isNaN(cycleInfo.horizontalLine) ? 0 : cycleInfo.horizontalLine;
        this.outerRadius = cycleInfo.outerRadius;
        this.innerRadius = cycleInfo.innerRadius;
        this.ringArea = cycleInfo.ringArea;
        this.fill = cycleInfo.fill;
        this.radius = cycleInfo.radius;

        this.buildCircle();
    }

    private buildCircle() {
        let radianCalculation: number;
        let startRadian: number,
            endRadian: number,
            lineY: number;

        lineY = this.lineY;
        if (this.isQuadrantOnly()) {
            radianCalculation = (0.5 * (this.quadrantNumber - 1));
            startRadian = ((radianCalculation - 0.5) * Math.PI);
            endRadian = (radianCalculation * Math.PI);
        } else {
            startRadian = -0.5 * Math.PI;
            endRadian = 1.5 * Math.PI;
        }

        //console.log("Path Builder: IR: %s | OR: %s | SR: %s | ER: %s", this.innerRadius, this.outerRadius, startRadian, endRadian);

        let arc = this.pathContext
            .innerRadius(this.innerRadius)
            .outerRadius(this.outerRadius)
            .startAngle(startRadian)
            .endAngle(endRadian);

        let transformX = this.transformationBase.x * this.radius;
        let transformY = this.transformationBase.y * this.radius;
        let textStart = Math.abs((this.radius - this.outerRadius) + ((this.outerRadius - this.innerRadius) / 2));
        if (isNaN(textStart)) textStart = 0;

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

    private isQuadrantOnly(): boolean {
        return (!isNaN(this.quadrantNumber) && this.quadrantNumber > 0);
    }

    public transformString(): string {
        //debugger;
        var x = isNaN(this.transform.x) ? 0 : this.transform.x;
        var y = isNaN(this.transform.y) ? 0 : this.transform.y;

        return 'translate(' + x.toString() + ', ' + y.toString() + ')';
    }

    public setQuadrantNumber(quadrantNumber: number): void {
        this.quadrantNumber = quadrantNumber;
        this.buildCircle();
    }
}

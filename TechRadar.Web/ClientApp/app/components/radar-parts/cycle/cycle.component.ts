import {
    Component,
    Input,
    SimpleChanges,
    OnChanges,
    OnInit
} from '@angular/core';

import { ChartModel, ChartQuadrant, ChartCycle } from '../../../models';

@Component({
    selector: '[radar-cycles]',
    templateUrl: './cycle.component.html',
    styleUrls: ['./cycle.component.scss']
})

export class CycleComponent implements OnChanges, OnInit {
    @Input() chartModel: ChartModel;
    @Input() quadrant: number;

    private radius: number;
    private horizontalLine: { x: number, y: number };
    private verticalLine: { x: number, y: number };
    private lineLength: number;
    private cycles: Array<ChartCycle>;

    constructor() {
        this.cycles = [];
        this.radius = 0;
        this.horizontalLine = { x: 0, y: 0 };
        this.verticalLine = { x: 0, y: 0 };
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.setup();
    }

    showCycle() {
        if (this.cycles == null) return false;
        if (this.cycles.length == 0) return false;

        return true;
    }

    private isQuadrantOnly(): boolean {
        if (isNaN(this.quadrant)) return false;

        return this.quadrant > 0;
    }

    private setup(): void {
        var horizontalLine = { x: 0, y: 0 };
        var verticalLine = { x: 0, y: 0 };

        if (this.chartModel) {
            this.radius = isNaN(this.chartModel.radius) ? 0 : this.chartModel.radius;
            this.cycles = this.chartModel.cycles;

            if (this.isQuadrantOnly()) {
                var quadrant = this.chartModel.soloQuadrant();

                this.horizontalLine = {
                    x: isNaN(quadrant.horizontalLine.x) ? 0 : quadrant.horizontalLine.x,
                    y: isNaN(quadrant.horizontalLine.y) ? 0 : quadrant.horizontalLine.y
                };

                this.verticalLine = {
                    x: isNaN(quadrant.verticalLine.x) ? 0 : quadrant.verticalLine.x,
                    y: isNaN(quadrant.verticalLine.y) ? 0 : quadrant.verticalLine.y
                };

                this.lineLength = this.radius;
            } else {
                this.horizontalLine = { x: 0, y: this.radius };
                this.verticalLine = { x: this.radius, y: 0 };
                this.lineLength = isNaN(this.chartModel.size) ? 0 : this.chartModel.size;
            }
        } else {
            this.horizontalLine = { x: 0, y: 0 };
            this.verticalLine = { x: 0, y: 0 };
            this.lineLength = 0;
        }
    }

    //private buildCircle() {
    //    let radianCalculation: number;
    //    let startRadian: number,
    //        endRadian: number,
    //        lineY: number;

    //    lineY = this.lineY;
    //    if (this.isQuadrantOnly()) {
    //        radianCalculation = (0.5 * (this.quadrantNumber - 1));
    //        startRadian = ((radianCalculation - 0.5) * Math.PI);
    //        endRadian = (radianCalculation * Math.PI);
    //    } else {
    //        startRadian = -0.5 * Math.PI;
    //        endRadian = 1.5 * Math.PI;
    //    }

    //    //console.log("Path Builder: IR: %s | OR: %s | SR: %s | ER: %s", this.innerRadius, this.outerRadius, startRadian, endRadian);

    //    let arc = this.pathContext
    //        .innerRadius(this.innerRadius)
    //        .outerRadius(this.outerRadius)
    //        .startAngle(startRadian)
    //        .endAngle(endRadian);

    //    let transformX = this.transformationBase.x * this.radius;
    //    let transformY = this.transformationBase.y * this.radius;
    //    let textStart = Math.abs((this.radius - this.outerRadius) + ((this.outerRadius - this.innerRadius) / 2));
    //    if (isNaN(textStart)) textStart = 0;

    //    this.path = arc();
    //    this.centerOfRing = {
    //        x: textStart,
    //        y: lineY + 10
    //    };
    //    this.transform = {
    //        x: transformX,
    //        y: transformY
    //    }
    //}

}
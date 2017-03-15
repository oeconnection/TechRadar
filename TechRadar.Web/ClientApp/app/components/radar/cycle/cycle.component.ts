import {
    Component,
    Input,
    OnChanges,
    OnInit
} from '@angular/core';

import { ChartModel, ChartQuadrant, ChartCycle } from '../../../models';

@Component({
    selector: '[radar-cycles]',
    templateUrl: './cycle.component.html',
    styleUrls: ['./cycle.component.css']
})

export class CycleComponent implements OnChanges, OnInit {
    @Input() chartModel: ChartModel;

    private radius: number;
    private horizontalLine: { x: number, y: number };
    private verticalLine: { x: number, y: number };
    private lineLength: number;
    private cycles: Array<ChartCycle>;

    constructor() {
    }

    ngOnInit(): void {
    }

    ngOnChanges(): void {
        this.setup();
    }

    private setup(): void {
        if (this.chartModel) {
            this.radius = this.chartModel.radius;
            this.cycles = this.chartModel.cycles;

            if (this.chartModel.isQuadrantOnly) {
                this.horizontalLine = { x: this.chartModel.quadrant.horizontalLine.x, y: this.chartModel.quadrant.horizontalLine.y };
                this.verticalLine = { x: this.chartModel.quadrant.verticalLine.x, y: this.chartModel.quadrant.verticalLine.y };
                this.lineLength = this.chartModel.radius;
            } else {
                this.horizontalLine = { x: 0, y: this.chartModel.radius };
                this.verticalLine = { x: this.chartModel.radius, y: 0 };
                this.lineLength = this.chartModel.size;
            }
        }
    }
}
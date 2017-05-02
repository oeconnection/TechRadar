import {
    Component,
    Input,
    OnChanges,
    SimpleChanges
} from "@angular/core";

import { Radar } from "../../../models";

@Component({
    selector: "radar-chart",
    templateUrl: "./chart.component.html",
    styleUrls: ["./chart.component.scss"]
})

export class ChartComponent implements OnChanges {
    @Input() data: Radar;
    @Input() quadrant: number;
    @Input() width: number;

    private chartAlignment: string;

    ngOnChanges(changes: SimpleChanges): void {
        if (this.isQuadrantOnly()) {
            this.chartAlignment = `text-${(this.quadrant === 1 || this.quadrant === 4) ? "right" : "left"}`;
        } else {
            this.chartAlignment = "text-center";
        }
    }

    private isQuadrantOnly(): boolean {
        if (isNaN(this.quadrant)) return false;

        return this.quadrant > 0;
    }
}
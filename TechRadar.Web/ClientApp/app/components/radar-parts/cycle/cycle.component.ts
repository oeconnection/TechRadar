import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewEncapsulation } from "@angular/core";
import { D3Service, D3 } from "d3-ng2-service";
import { Cycle, IPoint } from "../../../models";
import tinycolor = require("tinycolor2");

@Component({
    selector: "[radar-cycles]",
    template: "<svg:g></svg:g>",
    encapsulation: ViewEncapsulation.None,
    styles: [require("./cycle.component.scss")]
})

export class CycleComponent implements OnChanges {
    @Input() cycles: Cycle[];
    @Input() quadrant: number;
    @Input() width: number;

    private d3: D3;
    private parentNativeElement: any;
    private d3Svg: any;
    private radius: number;
    private startAngle: number;
    private endAngle: number;
    private centerOfChart: IPoint;
    private horizontalLine: IPoint;
    private verticalLine: IPoint;

    constructor(element: ElementRef, d3Service: D3Service) {
        this.d3 = d3Service.getD3();
        this.parentNativeElement = element.nativeElement;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.buildChart();
    }

    private buildChart() {
        if (this.parentNativeElement !== null) {
            this.d3Svg = this.d3.select(this.parentNativeElement).select("g");
            this.d3Svg.attr("width", this.width);
            this.d3Svg.attr("height", this.width);

            let checkforPreviousChart = this.d3Svg.selectAll("g");
            if (!checkforPreviousChart.empty()) {
                checkforPreviousChart.remove();
            }

            this.cycles = this.cycles.sort((a, b) => { return a.order - b.order });

            this.quadrantCalculations();

            this.buildArcs();
            this.buildLines();
        }
    }

    private quadrantCalculations(): void {
        if (this.quadrant > 0) {
            const radianCalculation = (0.5 * (this.quadrant - 1));

            this.startAngle = ((radianCalculation - 0.5) * Math.PI);
            this.endAngle = (radianCalculation * Math.PI);
            console.log("Start: %s | End: %s", this.startAngle, this.endAngle);
            this.radius = this.width;

            switch (this.quadrant) {
                case 1:
                    this.verticalLine = { x: this.width - 14, y: 0 };
                    this.horizontalLine = { x: 0, y: this.width - 14 };
                    this.centerOfChart = { x: this.width, y: this.width };
                    break;

                case 2:
                    this.verticalLine = { x: 0, y: 0 };
                    this.horizontalLine = { x: 0, y: this.width - 14 };
                    this.centerOfChart = { x: 0, y: this.width };
                    break;

                case 3:
                    this.verticalLine = { x: 0, y: 0 };
                    this.horizontalLine = { x: 0, y: 0 };
                    this.centerOfChart = { x: 0, y: 0 };
                    break;

                case 4:
                    this.verticalLine = { x: this.width - 14, y: 0 };
                    this.horizontalLine = { x: 0, y: 0 };
                    this.centerOfChart = { x: this.width, y: 0 };
                    break;
            }

        } else {
            this.startAngle  = -0.5 * Math.PI;
            this.endAngle = 1.5 * Math.PI;

            this.radius = this.width / 2;

            this.verticalLine = { x: (this.width / 2) - 7, y: 0 };
            this.horizontalLine = { x: 0, y: (this.width / 2) };
            this.centerOfChart = { x: this.width / 2, y: this.width / 2 };
        }

        return;
    }

    private buildArcs() {

        let ringRadiusTotal = this.cycles.reduce((previous, current) => previous + current.size, 0);

        let fillColor = "#a2a2a2";
            
        let arc = this.d3.arc<any, Cycle>()
            .innerRadius((d, i) => {
                let currentRadius = this.cycles.reduce((previous, current, currentIndex) => previous + ((currentIndex < i) ? current.size : 0), 0);
                let radius = (this.radius * currentRadius) / ringRadiusTotal;
                return radius;
            })
            .outerRadius((d, i) => {
                let currentRadius = this.cycles.reduce((previous, current, currentIndex) => previous + ((currentIndex <= i) ? current.size : 0), 0);
                let radius = (this.radius * currentRadius) / ringRadiusTotal;
                return radius;
            })
            .startAngle(this.startAngle)
            .endAngle(this.endAngle);

        let g = this.d3Svg.append("g").attr("transform", `translate(${this.centerOfChart.x},${this.centerOfChart.y})`);

        g.selectAll("path")
            .data(this.cycles).enter()
            .append("path")
            .attr("fill", (d, i) => tinycolor(fillColor).lighten(7 * i).toString())
            .attr("d", <any>arc);
    }

    private buildLines() {
        let ringRadiusTotal = this.cycles.reduce((previous, current) => previous + current.size, 0);

        let g = this.d3Svg.append("g");

        g.append("rect")
            .attr("x", this.verticalLine.x)
            .attr("y", this.verticalLine.y)
            .attr("class", "slice-border")
            .attr("width", 14)
            .attr("height", this.width);

        g.append("rect")
            .attr("x", this.horizontalLine.x)
            .attr("y", this.horizontalLine.y)
            .attr("class", "slice-border")
            .attr("width", this.width)
            .attr("height", 14);

        let textG = g.append("g");

        textG.selectAll("text")
            .data(this.cycles).enter()
            .append("text")
            .attr("class", "line-text")
            .attr("x", (d, i) => {
                let innerRadius = 0;
                let outerRadius = 0;

                this.cycles.forEach((cycle: Cycle, index: number) => {
                    innerRadius = innerRadius + ((index < i) ? cycle.size : 0);
                    outerRadius = outerRadius + ((index <= i) ? cycle.size : 0);

                });

                innerRadius = (this.radius * innerRadius) / ringRadiusTotal;
                outerRadius = (this.radius * outerRadius) / ringRadiusTotal;
                let newRadius = innerRadius + ((outerRadius - innerRadius) / 2);

                return this.radius - newRadius;
            })
            .attr("y", this.horizontalLine.y + 11)
            .attr("text-anchor", "middle")
            .text((d) => { return d.name });

    }
}
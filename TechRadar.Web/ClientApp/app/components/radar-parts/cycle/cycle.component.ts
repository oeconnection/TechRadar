import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, SimpleChange, ViewEncapsulation } from '@angular/core';
import { D3Service, D3, Selection, Arc } from 'd3-ng2-service';
import { Quadrant, Cycle, IPoint } from '../../../models';
import TinyColor = require('tinycolor2');

@Component({
    selector: '[radar-cycles]',
    template: '<svg:g></svg:g>',
    encapsulation: ViewEncapsulation.None,
    styles: [require('./cycle.component.scss')]
})

export class CycleComponent implements OnChanges, OnInit {
    @Input() cycles: Cycle[];
    @Input() quadrant: number;
    @Input() width: number;

    private d3: D3;
    private parentNativeElement: any;
    private d3ParentElement: Selection<HTMLElement, any, null, undefined>;
    private d3Svg: Selection<SVGSVGElement, any, null, undefined>;
    private d3G: Selection<SVGGElement, any, null, undefined>;
    private radius: number;
    private startAngle: number;
    private endAngle: number;

    private quadrantCssClass: string;
    private centerOfChart: IPoint;
    private horizontalLine: IPoint;
    private titleAnchor: string;
    private titlePosition: IPoint;
    private translate: IPoint;
    private verticalLine: IPoint;


    constructor(element: ElementRef, d3Service: D3Service) {
        this.d3 = d3Service.getD3();
        this.parentNativeElement = element.nativeElement;
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.buildChart();
    }

    private buildChart() {
        if (this.parentNativeElement !== null) {
            this.d3ParentElement = this.d3.select(this.parentNativeElement);

            this.d3Svg = this.d3ParentElement.select<SVGSVGElement>('g');
            this.d3Svg.attr('width', this.width);
            this.d3Svg.attr('height', this.width);

            let checkforPreviousChart = this.d3Svg.selectAll('g');
            if (!checkforPreviousChart.empty()) {
                checkforPreviousChart.remove();
            }

            this.cycles = this.cycles.sort((a, b) => { return a.order - b.order });

            this.quadrantCalculations();

            this.buildArcs();
            this.buildLines();
        }
    }

    private isQuadrantOnly(): boolean {
        if (isNaN(this.quadrant)) return false;

        return this.quadrant > 0;
    }

    private quadrantCalculations(): void {
        let radianCalculation: number;

        if (this.quadrant > 0) {
            radianCalculation = (0.5 * (this.quadrant - 1));
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

        let ringRadiusTotal = this.cycles.reduce(function (previous, current) {
            return previous + current.size;
        }, 0);

        let fillColor = "#a2a2a2";
            
        let arc = this.d3.arc<any, Cycle>()
            .innerRadius((d, i) => {
                let currentRadius: number = this.cycles.reduce(function (previous, current, currentIndex) {
                    return previous + ((currentIndex < i) ? current.size : 0);  // Exclude this ring
                }, 0);

                let radius = (this.radius * currentRadius) / ringRadiusTotal;
                //console.log('Arc for %s IR: %s', d.name, radius);
                return radius;
            })
            .outerRadius((d, i) => {
                let currentRadius: number = this.cycles.reduce(function (previous, current, currentIndex) {
                    return previous + ((currentIndex <= i) ? current.size : 0);  // Include this ring
                }, 0);

                let radius = (this.radius * currentRadius) / ringRadiusTotal;
                //console.log('Arc for %s OR: %s', d.name, radius);
                return radius;
            })
            .startAngle(this.startAngle)
            .endAngle(this.endAngle);

        let g = this.d3Svg.append("g").attr("transform", "translate(" + this.centerOfChart.x + "," + this.centerOfChart.y + ")");

        let background = g.selectAll("path")
            .data(this.cycles).enter()
            .append("path")
            .attr("fill", function (d, i) {
                return TinyColor(fillColor).lighten(7 * i).toString();
            })
            .attr("d", <any>arc);
    }

    private buildLines() {
        let ringRadiusTotal = this.cycles.reduce(function (previous, current) {
            return previous + current.size;
        }, 0);

        let g = this.d3Svg.append("g");

        g.append("rect")
            .attr("x", this.verticalLine.x)
            .attr("y", this.verticalLine.y)
            .attr("class", "slice-border")
            .attr("width", 14)
            .attr("height", this.width)

        g.append("rect")
            .attr("x", this.horizontalLine.x)
            .attr("y", this.horizontalLine.y)
            .attr("class", "slice-border")
            .attr("width", this.width)
            .attr("height", 14)

        let textG = g.append("g");

        textG.selectAll('text')
            .data(this.cycles).enter()
            .append('text')
            .attr('class', 'line-text')
            .attr('x', (d, i) => {
                let innerRadius: number = 0;
                let outerRadius: number = 0;

                this.cycles.forEach((cycle: Cycle, index: number) => {
                    innerRadius = innerRadius + ((index < i) ? cycle.size : 0);
                    outerRadius = outerRadius + ((index <= i) ? cycle.size : 0);

                })

                innerRadius = (this.radius * innerRadius) / ringRadiusTotal;
                outerRadius = (this.radius * outerRadius) / ringRadiusTotal;
                //console.log('%s Text IR: %s', d.name, innerRadius);
                //console.log('%s Text OR: %s', d.name, outerRadius);

                let newRadius = innerRadius + ((outerRadius - innerRadius) / 2);
                return this.radius - newRadius;
            })
            .attr('y', this.horizontalLine.y + 11)
            .attr('text-anchor', 'middle')
            .text((d) => { return d.name });

    }
}
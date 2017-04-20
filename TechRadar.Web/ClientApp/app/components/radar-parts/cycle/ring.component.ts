import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChange } from '@angular/core';
import { D3Service, D3, Selection, Arc } from 'd3-ng2-service';
import { Cycle } from '../../../models';
import TinyColor = require('tinycolor2');

@Component({
    selector: 'app-drag-zoom-2',
    template: '<svg width="100%" height="100%"></svg>'
})

export class RingComponent implements OnChanges, OnDestroy, OnInit {
    @Input() width: number = 400;
    @Input() height: number = 400;
    @Input() phylloRadius: number = 7;
    @Input() pointRadius: number = 2;

    private d3: D3;
    private parentNativeElement: any;
    private d3Svg: Selection<SVGSVGElement, any, null, undefined>;
    private d3G: Selection<SVGGElement, any, null, undefined>;

    constructor(element: ElementRef, d3Service: D3Service) {
        this.d3 = d3Service.getD3();
        this.parentNativeElement = element.nativeElement;
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (
            (changes['width'] && !changes['width'].isFirstChange()) ||
            (changes['height'] && !changes['height'].isFirstChange())
        ) {
            if (this.d3Svg.empty && !this.d3Svg.empty()) {
                this.changeLayout();
            }
        }

    }

    ngOnDestroy() {
        if (this.d3Svg.empty && !this.d3Svg.empty()) {
            this.d3Svg.selectAll('*').remove();
        }
    }

    ngOnInit() {
        this.buildArcs(3);
    }

    private changeLayout() {
        this.d3Svg
            .attr('width', this.width)
            .attr('height', this.height);


    }

    private createTestData(): Cycle[] {
        var cycles: Cycle[] = new Array<Cycle>();
        cycles.push(new Cycle({
            id: 'test1',
            name: 'Name 1',
            fullName: 'Full name 1',
            description: 'Description 1',
            order: 1,
            size: 10
        }));
        cycles.push(new Cycle({
            id: 'test2',
            name: 'Name 2',
            fullName: 'Full name 2',
            description: 'Description 2',
            order: 2,
            size: 15
        }));
        cycles.push(new Cycle({
            id: 'test3',
            name: 'Name 3',
            fullName: 'Full name 3',
            description: 'Description 3',
            order: 3,
            size: 20
        }));
        cycles.push(new Cycle({
            id: 'test4',
            name: 'Name 4',
            fullName: 'Full name 4',
            description: 'Description 4',
            order: 4,
            size: 25
        }));

        return cycles;

    }

    private buildArcs(quadrantNumber: number) {
        let d3 = this.d3;
        let d3ParentElement: Selection<HTMLElement, any, null, undefined>;
        let d3G: Selection<SVGGElement, any, null, undefined>;

        if (this.parentNativeElement !== null) {
            let cycles: Cycle[] = this.createTestData().sort((a, b) => { return b.order - a.order });

            var ringRadiusTotal = cycles.reduce(function (previous, current) {
                return previous + current.size;
            }, 0);

            d3ParentElement = d3.select(this.parentNativeElement);

            this.d3Svg = d3ParentElement.select<SVGSVGElement>('svg');

            this.d3Svg.attr('width', this.width);
            this.d3Svg.attr('height', this.height);

            let fillColor = "#a2a2a2";

            let radianCalculation: number;
            let startRadian: number,
                endRadian: number;

            if (quadrantNumber > 0) {
                radianCalculation = (0.5 * (quadrantNumber - 1));
                startRadian = ((radianCalculation - 0.5) * Math.PI);
                endRadian = (radianCalculation * Math.PI);
            } else {
                startRadian = -0.5 * Math.PI;
                endRadian = 1.5 * Math.PI;
            }

            var arc = d3.arc()
                .innerRadius((d, i) => {
                    var currentRadius: number = cycles.reduce(function (previous, current, currentIndex) {
                        return previous + ((currentIndex < i) ? current.size : 0);  // Exclude this ring
                    }, 0);

                    var newRadius = (100 * currentRadius) / ringRadiusTotal;
                    console.log("IR: %s | newRadius", i, newRadius);
                    return newRadius;
                })
                .outerRadius((d, i) => {
                    console.log("OR: %s", i);
                    var currentRadius: number = cycles.reduce(function (previous, current, currentIndex) {
                        return previous + ((currentIndex <= i) ? current.size : 0);  // Include this ring
                    }, 0);

                    var newRadius = (100 * currentRadius) / ringRadiusTotal;
                    console.log("OR: %s | newRadius", i, newRadius);
                    return newRadius;
                })
                .startAngle(startRadian)
                .endAngle(endRadian);

            var g = this.d3Svg.append("g").attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

            var background = g.selectAll("path")
                .data(cycles).enter()
                .append("path")
                .attr("fill", function (d, i) {
                    return TinyColor(fillColor).lighten(7 * i).toString();
                })
                .attr("d", <any>arc);
        };
    }
    
}
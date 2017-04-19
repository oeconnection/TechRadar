import {
    Component,
    ElementRef,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    OnChanges,
    ViewEncapsulation,
    ViewChild
} from '@angular/core';
import { D3Service, D3, Selection, Arc, EnterElement, Local } from 'd3-ng2-service';
import { Blip, Cycle, Quadrant, Radar, IPoint, IRange } from '../../../models';
import { RadarService, GlobalState } from '../../../services';
import * as Chance from 'chance';

@Component({
    selector: '[radar-blip]',
    template: '<svg:g></svg:g>',
    styleUrls: ['./blip.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class BlipComponent implements OnChanges {
    @Input() blips: Blip[];
    @Input() radar: Radar;
    @Input() width: number;
    @Input() quadrant: number;
    @ViewChild('g') private container: ElementRef;

    private stateSubscribe: any;
    private cycles: Cycle[];
    private d3: D3;
    private parentNativeElement: any;
    private d3ParentElement: Selection<HTMLElement, any, null, undefined>;
    private d3Svg: Selection<any, any, null, undefined>;
    private d3G: Selection<any, any, null, undefined>;
    private mouseOnBlip: Blip;
    private radius: number;
    private tooltip: Selection<any, any, null, undefined>;
    private soloQuadrant: Quadrant;

    private readonly activatedBlipEventName = 'activated.blip';

    constructor(element: ElementRef, private radarService: RadarService, d3Service: D3Service, private stateManager: GlobalState) {
        this.d3 = d3Service.getD3();
        this.parentNativeElement = element.nativeElement;
        this.mouseOnBlip = null;

        this.stateManager.subscribe(this.activatedBlipEventName, (blip: Blip) => {
            if (blip == null) {
                // Mouseout
                this.endHoverActions();
            } else {
                // Mouse Over
                this.showHoverActions(blip);
            }
        });
    }

    ngOnChanges(): void {
        if (this.radar != null) {
            this.buildBlips();
        }
    }

    private isQuadrantOnly(): boolean {
        if (isNaN(this.quadrant)) return false;

        return this.quadrant > 0;
    }

    private showBlip() {
        //if (this.blip == null) return false;
        return true;
    }

    private showShape(): boolean {
        //if (this.blip == null) return false;
        //if (this.chartBlip.shape == null) return false;
        //if (this.chartBlip.shape.x == null || isNaN(this.chartBlip.shape.x)) return false;
        //if (this.chartBlip.shape.y == null || isNaN(this.chartBlip.shape.y)) return false;
        return true;
    }

    private showText(): boolean {
        //if (this.chartBlip == null) return false;
        //if (this.chartBlip.text == null) return false;
        //if (this.chartBlip.text.x == null || isNaN(this.chartBlip.text.x)) return false;
        //if (this.chartBlip.text.y == null || isNaN(this.chartBlip.text.y)) return false;
        return true;
    }

    private buildBlips() {
        this.tooltip = this.d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

        this.radius = this.width / (this.isQuadrantOnly() ? 1 : 2);

        let blips: Blip[];
        if (this.isQuadrantOnly()) {
            this.soloQuadrant = this.radar.findQuadrantByNumber(this.quadrant);
            blips = this.blips.filter((blip: Blip) => { return blip.quadrantId === this.soloQuadrant.id });
        } else {
            blips = this.blips;
        }

        if (this.parentNativeElement !== null) {
            this.d3ParentElement = this.d3.select(this.parentNativeElement);

            this.d3Svg = this.d3ParentElement.select('g');
            let checkforPreviousChart = this.d3Svg.selectAll('g');
            if (!checkforPreviousChart.empty()) {
                checkforPreviousChart.remove();
            }
    
            this.cycles = this.radar.cycles.sort((a, b) => { return a.order - b.order });

            let ringRadiusTotal = this.cycles.reduce((previous, current) => {
                return previous + current.size;
            }, 0);

            let innerRadius: number = 0,
                outerRadius: number = 0,
                ringSizeSum: number = 0;

            this.cycles.forEach((cycle) => {
                innerRadius = (this.radius * ringSizeSum) / ringRadiusTotal;
                outerRadius = (this.radius * (ringSizeSum + cycle.size)) / ringRadiusTotal;

                let measurements = {
                    innerRadius: innerRadius,
                    outerRadius: outerRadius
                }

                // Blip
                this.createBlipsByCycle(cycle, { min: innerRadius, max: outerRadius }, blips.filter((blip: Blip) => { return blip.cycleId === cycle.id }));

                ringSizeSum = ringSizeSum + cycle.size;
            });
        }
    }

    private getBlipLocation(cycle: Cycle, blip: Blip, radii: IRange): IPoint {
        let adjustments: { x: number; y: number };
        let chartCenter: { x: number; y: number };


        let quadrant = this.radar.findQuadrantById(blip.quadrantId);

        if (quadrant == null) {
            return null;
        }

        let additionalProperties: {
            adjustment: { x: number, y: number },
            center: { x: number, y: number },
            css: string
        };
        switch (quadrant.quadrantNumber) {
            case 1:
                adjustments = { x: -1, y: -1 };
                chartCenter = { x: this.radius, y: this.radius };
                break;

            case 2:
                adjustments = { x: 1, y: -1 };
                chartCenter = { x: 0, y: this.radius };
                break;

            case 3:
                adjustments = { x: 1, y: 1 };
                chartCenter = { x: 0, y: 0 };
                break;

            case 4:
                adjustments = { x: -1, y: 1 };
                chartCenter = { x: this.radius, y: 0 };
                break;
        }

        if (!this.isQuadrantOnly()) {
            chartCenter = { x: this.radius, y: this.radius };
        }

        let angleInRad, radius;

        let split = blip.name.split('');
        let sum = split.reduce((p, c) => { return p + c.charCodeAt(0); }, 0);
        let chance = new Chance(sum * cycle.name.length * blip.blipNumber);

        let radiiCalcs = { min: radii.min, max: radii.max };

        if ((radii.max - 10) > (radii.min + 25)) {
            radiiCalcs.max = radiiCalcs.max - 10;
            radiiCalcs.min = radiiCalcs.min + 25;
        } else {
            radiiCalcs.max = radiiCalcs.max - 5;
            radiiCalcs.min = radiiCalcs.min + 5;
        }

        angleInRad = Math.PI * chance.integer({ min: 13, max: 85 }) / 180;
        radius = chance.floating(radiiCalcs);

        let x: number, y: number;
        x = chartCenter.x + (radius * Math.cos(angleInRad) * adjustments.x);
        y = chartCenter.y + (radius * Math.sin(angleInRad) * adjustments.y);

        return { x: x, y: y };
    }

    private buildBlipTransform(cycle: Cycle, blip: Blip, radii: IRange): string {
        let location = this.getBlipLocation(cycle, blip, radii);

        return "translate(" + location.x + "," + location.y + ")"
    }

    private trianglePoints(blip: Blip) {
        let tsize, top, left, right, bottom, points;

        tsize = 13 + blip.size;
        top = 0 - tsize;
        left = (0 - tsize + 1);
        right = (0 + tsize + 1);
        bottom = (0 + tsize - tsize / 2.5);

        return (0 + 1) + ',' + top + ' ' + left + ',' + bottom + ' ' + right + ',' + bottom;
    }

    private getBlipClassNameByQuadrantId(quadrantId: string) {
        let quadrant = this.radar.findQuadrantById(quadrantId);
        if (quadrant != null) {
            switch (quadrant.quadrantNumber) {
                case 1:
                    return 'first';

                case 2:
                    return 'second';

                case 3:
                    return 'third';

                case 4:
                    return 'fourth';
            }
        }

        return '';
    }

    private buildCircleItem(element: Selection<any, Blip, any, any>) {
        return element
            .filter((blip: Blip) => { return !blip.isNew })
            .append('circle')
            .attr('cx','0')
            .attr('cy', '4')
            .attr('class', (blip: Blip) => { return this.getBlipClassNameByQuadrantId(blip.quadrantId) })
            .attr('stroke-width', '1.5')
            .attr('r', (blip: Blip) => { return blip.size + 13 })
            .attr('opacity', '1')
    }

    private buildPolygonItem(element: Selection<any, Blip, any, any>) {
        return element
            .filter((blip: Blip) => { return blip.isNew })
            .append('polygon')
            .attr('points', (blip: Blip) => { return this.trianglePoints(blip); })
            .attr('class', (blip: Blip) => { return this.getBlipClassNameByQuadrantId(blip.quadrantId) })
            .attr('stroke-width', '1.5')
            .attr('opacity', '1')
    }

    private buildTextItem(element: Selection<any, Blip, any, any>) {
        return element.append('text')
            .attr('x', 0)
            .attr('y', 4)
            .attr('class', 'blip-text')
            .attr('text-anchor', 'middle')
            .text((blip: Blip) => { return blip.blipNumber })
            .append('svg:title')
            .text((blip: Blip) => { return blip.name })

    }

    private createBlipsByCycle(cycle: Cycle, radii: IRange, blips: Blip[] ) {

        let blipA = this.d3Svg.append('g').selectAll('a')
            .data(blips).enter()
            .append('a')
            .attr("class", "blip-group")
            .attr("placement", "top")
            .attr("container", "body")
            .attr('opacity', (blip: Blip, i): string => {
                return this.blipOpacity(blip).toString();
            })
            .on('mouseover', (blip: Blip, index: number) => {
                this.onMouseOverBlip(blip);
            })
            .on('mouseout', (blip: Blip, index: number) => {
                this.onMouseOutBlip();
            })
        let circleElement = this.buildCircleItem(blipA);

        let polygonElement = this.buildPolygonItem(blipA);

        let textElement = this.buildTextItem(blipA);

        blipA.attr("transform", (blip: Blip) => { return this.buildBlipTransform(cycle, blip, radii) });
    }

    private showHoverActions(blip: Blip) {
        if (blip == null) {
            return;
        } else {
            if (this.d3.event != null) {
                this.tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);

                this.tooltip.html(blip.blipNumber + '. ' + blip.name)
                    .style('left', (this.d3.event.pageX) + "px")
                    .style('top', (this.d3.event.pageY - 28) + "px");
            }

            this.mouseOnBlip = blip;
            this.d3Svg.selectAll('.blip-group').style('opacity', (item: Blip) => {
                return blip.blipNumber == item.blipNumber ? 1 : 0.5;
            });
        }
    }

    public onMouseOverBlip(blip: Blip): void {
        this.showHoverActions(blip);
        this.stateManager.notifyDataChanged(this.activatedBlipEventName, blip);
    }

    private endHoverActions() {
        this.tooltip.transition()
            .duration(500)
            .style('opacity', 0);

        this.mouseOnBlip = null;
        this.d3Svg.selectAll('.blip-group').style('opacity', 1);
    }

    public onMouseOutBlip(): void {
        this.endHoverActions();
        this.stateManager.notifyDataChanged(this.activatedBlipEventName, null);
    }

    public blipOpacity(blip: Blip): number {
        if (this.mouseOnBlip == null) {
            return 1;
        }

        if (this.mouseOnBlip.blipNumber == blip.blipNumber) {
            return 1;
        } else {
            return .5;
        }

    }
}
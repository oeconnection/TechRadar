import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    ViewEncapsulation,
    ViewChild
    } from "@angular/core";
import { D3Service, D3 } from "d3-ng2-service";
import { Blip, Cycle, Quadrant, Radar, IPoint, IRange } from "../../../models";
import { RadarService } from "../../../services";
import { IHoverState, ON_HOVER, OFF_HOVER } from "../../../services/state-management";
import * as Chance from "chance";
import { Store } from "@ngrx/store";

@Component({
    selector: "[radar-blip]",
    template: "<svg:g></svg:g>",
    styleUrls: ["./blip.component.scss"],
    encapsulation: ViewEncapsulation.None
})

export class BlipComponent implements OnChanges {
    @Input() radar: Radar;
    @Input() width: number;
    @Input() quadrant: number;
    @ViewChild("g") private container: ElementRef;

    private blips: Blip[];
    private stateSubscribe: any;
    private cycles: Cycle[];
    private readonly d3: D3;
    private readonly parentNativeElement: any;
    private d3Svg: any;
    private mouseOnBlip: Blip;
    private radius: number;
    private tooltip: any;
    private soloQuadrant: Quadrant;

    private readonly activatedBlipEventName = "activated.blip";

    constructor(element: ElementRef,
        private radarService: RadarService,
        d3Service: D3Service,
        private store: Store<IHoverState>) {

        this.d3 = d3Service.getD3();
        this.parentNativeElement = element.nativeElement;
        this.mouseOnBlip = null;

        store.select("hoverStoreReducer")
            .subscribe((data: IHoverState) => {
                if (data.activeBlip == null) {
                    // Mouseout
                    this.endHoverActions();
                } else {
                    // Mouse Over
                    this.showHoverActions(data.activeBlip);
                };
            });
    }

    ngOnChanges(): void {
        if (this.radar != null) {
            this.blips = this.radar.blips;
            this.buildBlips();
        }
    }

    private isQuadrantOnly(): boolean {
        if (isNaN(this.quadrant)) return false;

        return this.quadrant > 0;
    }

    private buildBlips() {
        this.tooltip = this.d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

        this.radius = this.width / (this.isQuadrantOnly() ? 1 : 2);

        let blips: Blip[];
        if (this.isQuadrantOnly()) {
            this.soloQuadrant = this.radar.findQuadrantByNumber(this.quadrant);
            blips = this.blips.filter((blip: Blip) => { return blip.quadrantId === this.soloQuadrant.id });
        } else {
            blips = this.blips;
        }

        if (this.parentNativeElement !== null) {
            let d3ParentElement = this.d3.select(this.parentNativeElement);

            this.d3Svg = d3ParentElement.select("g");

            let checkforPreviousChart = this.d3Svg.selectAll("g");
            if (!checkforPreviousChart.empty()) {
                checkforPreviousChart.remove();
            }

            this.cycles = this.radar.cycles.sort((a, b) => { return a.order - b.order });

            let ringRadiusTotal = this.cycles.reduce((previous, current) => {
                return previous + current.size;
            }, 0);

            let innerRadius = 0,
                outerRadius = 0,
                ringSizeSum = 0;

            this.cycles.forEach((cycle) => {
                innerRadius = (this.radius * ringSizeSum) / ringRadiusTotal;
                outerRadius = (this.radius * (ringSizeSum + cycle.size)) / ringRadiusTotal;

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

        default:
            adjustments = { x: 1, y: 1 };
            chartCenter = { x: this.radius, y: this.radius };

        }

        if (!this.isQuadrantOnly()) {
            chartCenter = { x: this.radius, y: this.radius };
        }
        let split = blip.name.split("");
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

        let angleInRad = Math.PI * chance.integer({ min: 13, max: 85 }) / 180;
        let radius = chance.floating(radiiCalcs);

        let x = chartCenter.x + (radius * Math.cos(angleInRad) * adjustments.x);
        let y = chartCenter.y + (radius * Math.sin(angleInRad) * adjustments.y);

        return { x: x, y: y };
    }

    private buildBlipTransform(cycle: Cycle, blip: Blip, radii: IRange): string {
        const location = this.getBlipLocation(cycle, blip, radii);

        return `translate(${location.x},${location.y})`;
    }

    private trianglePoints(blip: Blip) {
        const tsize = 10 + (this.radar.sized ? (2 ^ blip.size) : 1);
        const top = 0 - tsize;
        const left = (0 - tsize + 1);
        const right = (0 + tsize + 1);
        const bottom = (0 + tsize - tsize / 2.5);

        return (0 + 1) + "," + top + " " + left + "," + bottom + " " + right + "," + bottom;
    }

    private getBlipClassNameByQuadrantId(quadrantId: string) {
        let quadrant = this.radar.findQuadrantById(quadrantId);
        if (quadrant != null) {
            switch (quadrant.quadrantNumber) {
            case 1:
                return "first";

            case 2:
                return "second";

            case 3:
                return "third";

            case 4:
                return "fourth";
            }
        }

        return "";
    }

    private buildCircleItem(element: any) {
        return element
            .filter((blip: Blip) => { return !blip.isNew })
            .append("circle")
            .attr("cx", "0")
            .attr("cy", "4")
            .attr("class", (blip: Blip) => { return this.getBlipClassNameByQuadrantId(blip.quadrantId) })
            .attr("stroke-width", "1.5")
            .attr("r", (blip: Blip) => { return (this.radar.sized ? (2 * (2 ^ blip.size)) + 10 : 11); })
            .attr("opacity", "1");
    }

    private buildPolygonItem(element: any) {
        return element
            .filter((blip: Blip) => { return blip.isNew })
            .append("polygon")
            .attr("points", (blip: Blip) => { return this.trianglePoints(blip); })
            .attr("class", (blip: Blip) => { return this.getBlipClassNameByQuadrantId(blip.quadrantId) })
            .attr("stroke-width", "1.5")
            .attr("opacity", "1");
    }

    private buildTextItem(element: any) {
        return element.append("text")
            .attr("x", 0)
            .attr("y", (blip: Blip) => { return blip.isNew ? 4 : 7 })
            .attr("class", "blip-text")
            .attr("text-anchor", "middle")
            .text((blip: Blip) => { return blip.blipNumber })
            .append("svg:title")
            .text((blip: Blip) => { return blip.name });

    }

    private createBlipsByCycle(cycle: Cycle, radii: IRange, blips: Blip[]) {

        let blipA = this.d3Svg.append("g").selectAll("a")
            .data(blips).enter()
            .append("a")
            .attr("class", "blip-group")
            .attr("placement", "top")
            .attr("container", "body")
            .attr("opacity",
                (blip: Blip): string => {
                    return this.blipOpacity(blip).toString();
                })
            .on("mouseover",
                (blip: Blip) => {
                    this.onMouseOverBlip(blip);
                })
            .on("mouseout",
                () => {
                    this.onMouseOutBlip();
                });

        this.buildCircleItem(blipA);

        this.buildPolygonItem(blipA);

        this.buildTextItem(blipA);

        blipA.attr("transform", (blip: Blip) => { return this.buildBlipTransform(cycle, blip, radii) });
    }

    private showHoverActions(blip: Blip) {
        if (blip == null) {
            return;
        } else {
            if (this.d3.event != null) {
                this.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                this.tooltip.html(blip.blipNumber + ". " + blip.name)
                    .style("left", (this.d3.event.pageX) + "px")
                    .style("top", (this.d3.event.pageY - 28) + "px");
            }

            this.mouseOnBlip = blip;
            this.d3Svg.selectAll(".blip-group").style("opacity", (item: Blip) => {
                return blip.blipNumber === item.blipNumber ? 1 : 0.3;
            });
        }
    }

    onMouseOverBlip(blip: Blip): void {
        this.showHoverActions(blip);
        //this.stateManager.notifyDataChanged(this.activatedBlipEventName, blip);
        this.store.dispatch({ type: ON_HOVER, payload: { activeBlip: blip } });
    }

    private endHoverActions() {
        if (this.tooltip != null) {
            this.tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        }

        this.mouseOnBlip = null;

        if (this.d3Svg != null) {
            this.d3Svg.selectAll(".blip-group").style("opacity", 1);
        }
    }

    onMouseOutBlip(): void {
        this.endHoverActions();
//        this.stateManager.notifyDataChanged(this.activatedBlipEventName, null);
        this.store.dispatch({ type: OFF_HOVER });
    }

    blipOpacity(blip: Blip): number {
        if (this.mouseOnBlip == null) {
            return 1;
        }

        if (this.mouseOnBlip.blipNumber === blip.blipNumber) {
            return 1;
        } else {
            return .5;
        }

    }
}
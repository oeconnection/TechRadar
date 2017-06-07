import {
    Component,
    ElementRef,
    Input,
    OnInit,
    OnChanges,
    OnDestroy,
    ViewChild,
    SimpleChanges
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Radar, Blip, Quadrant } from "../../../models";
import { RadarService, ThemeSpinnerService } from "../../../services";
import { D3Service, D3 } from "d3-ng2-service";
import { Observable } from "rxjs/Rx";
import { isPlatformBrowser } from "@angular/common";

@Component({
    selector: "app-radar",
    templateUrl: "./radar-display.component.html",
    styleUrls: ["./radar-display.component.scss"]
})
export class RadarDisplayComponent implements OnInit, OnDestroy, OnChanges {
    @ViewChild("chartArea") chartElement: ElementRef;
    @Input() id: string;
    @Input() quadrant: number;

    private d3: D3; 
    private radarName: string;
    private radarDescription: string;
    private routingParams: any;
    private dataSub: any;
    private radarData: Radar;
    private width: number;
    private height: number;
    private blips: Blip[];
    private chosenQuadrant: Quadrant;

    constructor(private route: ActivatedRoute,
        private router: Router,
        private radarService: RadarService,
        private d3Service: D3Service,
        private spinner: ThemeSpinnerService) {
        this.d3 = d3Service.getD3(); 
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["id"]) {
            this.getData(changes);
        } else {
            if (changes["quadrant"]) {
                this.quadrant = changes["quadrant"].currentValue;
                if (this.quadrant != null) {
                    this.chosenQuadrant = this.radarData.findQuadrantByNumber(this.quadrant);
                }
            }
        }
    }

    ngOnInit() {
        if (this.id === undefined || this.id === null) {
            this.router.navigate(["/"]);
        }
    }

    ngOnDestroy(): void {
        this.dataSub.unsubscribe();
    }

    private quadrantName() {
        if (this.radarData != null && this.isQuadrantOnly()) {
            return this.chosenQuadrant.name;
        } else {
            return null;
        }
    }

    private quadrantDescription() {
        if (this.radarData != null && this.isQuadrantOnly()) {
            return this.chosenQuadrant.description;
        } else {
            return null;
        }
    }

    private isQuadrantOnly() {
        return !isNaN(this.quadrant) && this.quadrant > 0;
    }

    private getData(changes: SimpleChanges) {
        this.spinner.show();
        this.dataSub = Observable.forkJoin(
            this.radarService.getRadar(this.id),
            this.radarService.getRadarBlips(this.id)
        ).subscribe(data => {
            this.radarData = data[0] as Radar;
            this.setBlipData(data[1] as Blip[]);

            if (this.radarData) {
                this.setProperties();
            } else {
                this.router.navigate(["/"]);
            };

            if (changes["quadrant"]) {
                this.quadrant = changes["quadrant"].currentValue;
                if (this.quadrant != null) {
                    this.chosenQuadrant = this.radarData.findQuadrantByNumber(this.quadrant);
                }
            }
            this.spinner.hide();
        });
    }

    private showQuadrantLists(quadrantNumbers: number[]): boolean {

        if (!this.isQuadrantOnly()) return true;

        if (Array.isArray(quadrantNumbers)) {
            if (quadrantNumbers.length === 0) return false;

            return quadrantNumbers.some((item) => {
                return this.quadrant === item;
            });
        }
        return false;
    }

    private showQuadrantList(quadrantNumber: number): boolean {
        if (!this.isQuadrantOnly()) return true;

        return (!quadrantNumber || this.quadrant === quadrantNumber);
    }

    private setProperties() {
        if (isPlatformBrowser) {
            this.width = window.innerWidth;
            this.height = window.innerHeight - 220;
        }

        this.radarName = this.radarData.name;
        this.radarDescription = this.radarData.description;

        this.radarData.blips = this.blips;
    }

    private sortBlip(blipA: Blip, blipB: Blip): number {
        // Get Cycle and quadrant
        let quadA = this.radarData.findQuadrantById(blipA.quadrantId);
        let quadB = this.radarData.findQuadrantById(blipB.quadrantId);
        let cycleA = this.radarData.findCycleById(blipA.cycleId);
        let cycleB = this.radarData.findCycleById(blipB.cycleId);

        if (quadA.quadrantNumber < quadB.quadrantNumber) return -1;
        if (quadA.quadrantNumber > quadB.quadrantNumber) return 1;

        if (cycleA.order < cycleB.order) return -1;
        if (cycleA.order > cycleB.order) return 1;

        if (blipA.name.toLowerCase < blipB.name.toLowerCase) return -1;
        if (blipA.name.toLowerCase > blipB.name.toLowerCase) return 1;

        return 0;
    }

    private setBlipData(blips: Blip[]): void {
        let blipNumber = 1;
        this.blips = new Array<Blip>();
        blips.sort((a: Blip, b: Blip) => { return this.sortBlip(a, b); }).forEach((blip: Blip): void => {
            let newBlip = blip;
            newBlip.blipNumber = blipNumber++;
            this.blips.push(newBlip);
        });
    }


}


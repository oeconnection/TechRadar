import {
    Component,
    OnChanges,
    AfterViewInit,
    Input,
    OnInit,
    ElementRef,
    ViewChild
} from '@angular/core';
import { Radar, Quadrant, RadarConfig, ChartQuadrant, ChartModel, ChartCycle, ChartBlip } from '../../../models';
import { RadarService } from '../../../services';

@Component({
    selector: 'quadrant-list',
    templateUrl: './quadrant-list.component.html',
    styleUrls: ['./quadrant-list.component.css']
})
export class QuadrantListComponent implements OnChanges {
    @Input() chartData: ChartModel;
    @Input() quadrant: number;

    private quadrantData: ChartQuadrant;
    private blips: ChartBlip[];
    private cycles: Array<ChartCycle>;
    private radarId: string;
    private panelClass: string;
    private activeBlip: number;

    constructor(private radarService: RadarService) {
        this.panelClass = '';
        this.activeBlip = null;

        this.radarService.getActiveBlip().subscribe(blip => {
            if (!(this.activeBlip == blip)) {
                this.activeBlip = blip;
            }
        });
    }

    ngOnChanges() {
        this.setup();
    }

    private setup(): void {
        if (this.chartData) {
            this.quadrantData = this.chartData.findQuadrantByNumber(this.quadrant);
            this.blips = this.chartData.findBlipsByQuadrantId(this.quadrantData.id);
            this.cycles = this.chartData.cycles;
            this.radarId = this.chartData.radar.radarId;

            this.panelClass = 'panel-' + this.quadrantData.cssClass;
        }
    }

    public onMouseOverBlip(blip: number): void {
        if (!(this.activeBlip == blip)) {
            this.activeBlip = blip;
            this.radarService.setActiveBlip(blip);
        }
    }

    public onMouseOutBlip(): void {
        if (!(this.activeBlip == 0)) {
            this.activeBlip = 0;
            this.radarService.setActiveBlip(0);
        }
    }

    public blipOpacity(blip: number): number {
        if (this.activeBlip == 0) {
            return 1;
        }

        if (this.activeBlip == blip) {
            return 1;
        } else {
            return .5;
        }
    }

    public isActiveBlip(blip: number): boolean {
        return this.activeBlip == blip;
    }

    private getBlipsByCycleId(id: string): ChartBlip[] {
        return this.blips.filter(x => x.cycleId == id);
    }
}

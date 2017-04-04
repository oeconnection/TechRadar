import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    OnInit
} from '@angular/core';

import { D3Service, D3 } from 'd3-ng2-service';
import { RadarConfig, ChartModel, ChartBlip } from '../../../models';
import { RadarService } from '../../../services';

@Component({
    selector: 'radar-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss']
})

export class ChartComponent implements OnChanges, OnInit {
    @Input() chartData: ChartModel;
    @Input() quadrant: number;

    private chartAlignment: string;
    private mouseOnBlip: number;
    private blips: Array<ChartBlip>;
    private show: boolean;

    constructor(private d3Service: D3Service, private radarService: RadarService) {
        this.mouseOnBlip = 0;
        this.blips = [];

        this.show = false;
    }

    ngOnInit(): void {
        this.radarService.getActiveBlip().subscribe(blip => {
            if (!(this.mouseOnBlip == blip)) {
                this.mouseOnBlip = blip;
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.chartData) {
            this.setupViewModel();
        }
    }

    private setupViewModel(): void {
        this.show = false;
        var soloQuadrant = this.chartData.soloQuadrant();
        if (this.chartData.isQuadrantOnly()) {
            this.chartAlignment = soloQuadrant.chartAlignment;
            this.blips = this.chartData.blips.filter((item) => item.quadrantId == soloQuadrant.id);
        } else {
            this.chartAlignment = 'text-center';
            this.blips = this.chartData.blips;
        }

        this.show = true;
    }   

    public onMouseOverBlip(blip: number): void {
        if (!(this.mouseOnBlip == blip)) {
            this.mouseOnBlip = blip;
            this.radarService.setActiveBlip(blip);
        }
    }

    public onMouseOutBlip(): void {
        if (!(this.mouseOnBlip == 0)) {
            this.mouseOnBlip = 0;
            this.radarService.setActiveBlip(0);
        }
    }

    public blipOpacity(blip: number): number {
        if (this.mouseOnBlip == 0) {
            return 1;
        }

        if (this.mouseOnBlip == blip) {
            return 1;
        } else {
            return .5;
        }

    }
 
}
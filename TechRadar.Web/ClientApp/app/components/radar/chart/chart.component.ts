import {
    Component,
    Input,
    OnChanges,
    OnInit
} from '@angular/core';

import { D3Service, D3 } from 'd3-ng2-service';
import { RadarConfig, ChartModel, ChartBlip } from '../../../models';
import { RadarService } from '../../../services';


@Component({
    selector: 'radar-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.css']
})

export class ChartComponent implements OnChanges, OnInit {
    @Input() chartData: ChartModel;

    private chartAlignment: string;
    private mouseOnBlip: number;
    private blips: Array<ChartBlip>;

    constructor(private d3Service: D3Service, private radarService: RadarService) {
        this.mouseOnBlip = 0;
        this.blips = [];
    }

    ngOnInit(): void {
        debugger;

        this.radarService.getActiveBlip().subscribe(blip => {
            if (!(this.mouseOnBlip == blip)) {
                this.mouseOnBlip = blip;
            }
        });
        //if (this.chartData) {
        //    this.setupViewModel();
        //}

    }

    ngOnChanges(): void {
        debugger;
        if (this.chartData) {
            this.setupViewModel();
        }
    }

    private setupViewModel(): void {
        debugger;
        this.blips = this.chartData.allBlips();

        if (this.chartData.isQuadrantOnly) {
            this.chartAlignment = this.chartData.quadrant.chartAlignment;
        } else {
            this.chartAlignment = 'text-center';
        }
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
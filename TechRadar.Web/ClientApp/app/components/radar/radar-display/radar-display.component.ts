import {
    Component,
    ElementRef,
    OnInit,
    OnChanges,
    OnDestroy,
    AfterViewInit,
    ViewChild,
    NgZone
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Radar, Quadrant, RadarConfig, ChartModel } from '../../../models';
import { RadarService } from '../../../services';
import { D3Service, D3 } from 'd3-ng2-service';

@Component({
    selector: 'app-radar',
    templateUrl: './radar-display.component.html',
    styleUrls: ['./radar-display.component.css']
})
export class RadarDisplayComponent implements OnInit, OnDestroy, OnChanges {
    @ViewChild('chartArea') chartElement: ElementRef;

    private radarId: string;
    private radarName: string;
    private radarDescription: string;
    private quadrant: number;
    private sub: any;
    private radarData: Radar;
    private isQuadrantOnly: boolean;
    private chartConfig: RadarConfig;
    private showQuadrantListOnLeft: boolean;
    private showQuadrantListOnRight: boolean;
    private showQuadrantsList: boolean;
    private chartAlignmentClass: string;
    private chartData: ChartModel;
    private d3: D3; 
    private width: number;
    private height: number;

    constructor(private route: ActivatedRoute, private radarService: RadarService, private d3Service: D3Service) {
        this.d3 = d3Service.getD3(); 

        this.width = window.innerWidth;
        this.height = window.innerHeight - 220;
    }

    ngOnChanges() {
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.radarId = params['name'];
            this.quadrant = +params['quadrantNumber'];

            this.isQuadrantOnly = this.quadrant > 0;

            this.sub = this.radarService.getRadar(this.radarId).subscribe(data => {
                this.radarData = data;
                if (data) {
                    this.setModel();
                    this.radarName = data.name;
                    this.radarDescription = data.description;
                };
            });
        });
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    setModel() {
        let chartConfig = {
            settings: {
                quadrant: this.quadrant,
                size: this.height, 
                name: this.radarName,
            }, dataset: this.radarData
        };
        this.chartData = new ChartModel(chartConfig, this.d3);
        this.showQuadrantListOnLeft = (this.quadrant == 2 || this.quadrant == 3);
        this.showQuadrantListOnRight = (this.quadrant == 1 || this.quadrant == 4);
        this.showQuadrantsList = !this.isQuadrantOnly;

        if (this.isQuadrantOnly) {
            if (this.showQuadrantListOnLeft) {
                this.chartAlignmentClass = 'left';
            } else {
                this.chartAlignmentClass = 'right';
            }
        } else {
            this.chartAlignmentClass = '';
        }
    }
}

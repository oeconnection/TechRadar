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
import { Radar, Quadrant, RadarConfig, ChartModel, Blip } from '../../../models';
import { RadarService } from '../../../services';
import { D3Service, D3 } from 'd3-ng2-service';
import { Observable } from 'rxjs/Rx';

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
    private routingParams: any;
    private dataSub: any;
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
    private blips: Blip[];

    constructor(private route: ActivatedRoute, private radarService: RadarService, private d3Service: D3Service) {
        this.d3 = d3Service.getD3(); 

        this.width = window.innerWidth;
        this.height = window.innerHeight - 220;
    }

    ngOnChanges() {
    }

    ngOnInit() {
        this.getData();
    }

    ngOnDestroy(): void {
        this.dataSub.unsubscribe();
    }

    private getData() {
        this.routingParams = this.route.params.subscribe(params => {
            this.radarId = params['name'];
            this.quadrant = +params['quadrantNumber'];

            this.isQuadrantOnly = this.quadrant > 0;

            var blipObservable: Observable<Blip[]>;
            if (this.isQuadrantOnly) {
                blipObservable = this.radarService.getRadarBlips(this.radarId);
            } else {
                blipObservable = this.radarService.getRadarQuadrantBlips(this.radarId, this.quadrant);
            }

            this.dataSub = Observable.forkJoin(
                this.radarService.getRadar(this.radarId),
                blipObservable).subscribe(data => {
                    this.radarData = data[0];
                    this.blips = data[1];

                    if (this.radarData) {
                        this.setModel();
                        this.radarName = this.radarData.name;
                        this.radarDescription = this.radarData.description;
                    };
                });
        });
    }

    private setModel() {
        let chartConfig = {
            settings: {
                quadrant: this.quadrant,
                size: this.height, 
                name: this.radarName,
            }, dataset: {
                radar: this.radarData,
                blips: this.blips
            }
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

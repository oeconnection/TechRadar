import {
    Component,
    ElementRef,
    Input,
    OnInit,
    OnChanges,
    OnDestroy,
    AfterViewInit,
    ViewChild,
    SimpleChanges,
    NgZone
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Radar, Quadrant, RadarConfig, ChartModel, Blip } from '../../../models';
import { RadarService } from '../../../services';
import { D3Service, D3 } from 'd3-ng2-service';
import { Observable } from 'rxjs/Rx';
import { isBrowser } from 'angular2-universal';

@Component({
    selector: 'app-radar',
    templateUrl: './radar-display.component.html',
    styleUrls: ['./radar-display.component.css']
})
export class RadarDisplayComponent implements OnInit, OnDestroy, OnChanges {
    @ViewChild('chartArea') chartElement: ElementRef;
    @Input() code: string;
    @Input() quadrant: number;

    private showChart: boolean;
    private d3: D3; 
    private radarName: string;
    private radarDescription: string;
    private routingParams: any;
    private dataSub: any;
    private radarData: Radar;
    private chartConfig: RadarConfig;
    private chartData: ChartModel;
    private width: number;
    private height: number;
    private blips: Blip[];
    private show: boolean;

    constructor(private route: ActivatedRoute, private radarService: RadarService, private d3Service: D3Service) {
        this.show = false;
        this.showChart = false;
        this.d3 = d3Service.getD3(); 
    }

    ngOnChanges(changes: SimpleChanges) {
        var subscribers: any[];

        if (changes['code']) {
            this.getData();
        } else {
            if (changes['quadrant']) {
                this.chartData.setQuadrant(changes['quadrant'].currentValue);
            }
        }

    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.dataSub.unsubscribe();
    }

    private isQuadrantOnly() {
        return !isNaN(this.quadrant) && this.quadrant > 0;
    }

    private getData() {
        this.showChart = false;
        this.dataSub = Observable.forkJoin(
            this.radarService.getRadar(this.code),
            this.radarService.getRadarBlips(this.code)
        ).subscribe(data => {
            this.radarData = data[0];
            this.blips = data[1];

            if (this.radarData) {
                this.setProperties();

                this.buildChartData();
            };
            this.showChart = true;
        });
    }

    private showQuadrantLists(quadrantNumbers: number[]): boolean {

        if (!this.isQuadrantOnly()) return true;

        if (Array.isArray(quadrantNumbers)) {
            if (quadrantNumbers.length == 0) return false;

            return quadrantNumbers.some((item) => {
                return this.quadrant === item;
            });
        }
        return false;
    }

    private showQuadrantList(quadrantNumber: number): boolean {
        if (!this.isQuadrantOnly()) return true;

        return (!quadrantNumber || this.quadrant == quadrantNumber);
    }

    private setProperties() {
        if (isBrowser) {
            this.width = window.innerWidth;
            this.height = window.innerHeight - 220;
        }

        this.radarName = this.radarData.name;
        this.radarDescription = this.radarData.description;
    }

    private buildChartData() {
        this.show = false;
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

        var chart = new ChartModel(chartConfig, this.d3);
        this.chartData = chart;

        this.show = true;
    }

}

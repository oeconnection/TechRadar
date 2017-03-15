import { Component, OnInit, OnDestroy } from '@angular/core';
import { RadarService } from '../../services';
import { Radar, Quadrant, Cycle, ChartModel } from '../../models';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    private sub: any;
    private radars: Array<Radar>;

    constructor(private radarService: RadarService) {
    }

    ngOnInit() {
        this.sub = this.radarService.getRadarList().subscribe(data => {
            this.radars = data;
        });
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

}

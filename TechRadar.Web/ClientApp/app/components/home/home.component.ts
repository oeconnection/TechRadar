import { Component, OnInit, OnDestroy } from '@angular/core';
import { RadarService } from '../../services';
import { Radar, Quadrant, Cycle } from '../../models';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
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

    isRadarReady(radar: Radar): boolean {
        return !(radar.cycles == null || radar.quadrants == null);
    }

}

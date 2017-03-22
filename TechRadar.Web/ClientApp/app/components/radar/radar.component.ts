import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Radar, Quadrant, Cycle } from '../../models';
import { isBrowser } from 'angular2-universal';

@Component({
    selector: 'radar',
    templateUrl: './radar.component.html'
})
export class RadarComponent implements OnInit {
    private radarId: string;
    private quadrant: number;

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.radarId = params['name'];
        });

        this.route.queryParams.subscribe(params => {
            this.quadrant = +params['quad'];
        });
    }
}

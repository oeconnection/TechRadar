import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Radar, Quadrant, Cycle } from '../../models';

@Component({
    selector: 'radar',
    templateUrl: './radar.component.html'
})
export class RadarComponent implements OnInit {
    private id: string;
    private quadrant: number;

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.id = params['id'];
        });

        this.route.queryParams.subscribe(params => {
            this.quadrant = +params['quad'];
        });
    }
}

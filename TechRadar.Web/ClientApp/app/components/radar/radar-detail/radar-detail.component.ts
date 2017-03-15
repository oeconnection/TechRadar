import {
    Component,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RadarService } from '../../../services';
import { Radar, Quadrant } from '../../../models';

@Component({
  selector: 'app-radar-detail',
  templateUrl: './radar-detail.component.html',
  styleUrls: ['./radar-detail.component.css'],
  providers: [RadarService]
})
export class RadarDetailComponent implements OnInit, OnDestroy {
    private radarName: string;
    private radarDescription: string;
    private quadrantName: string;
    private radarNumber: number;
    private sub: any;
    private radarData: Radar;
    private radarTitle: string;
    private quadrant: Quadrant;

    constructor(private route: ActivatedRoute, private radarService: RadarService) { }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.radarName = params['name'];
            this.radarNumber = +params['quadrantNumber'];

            //this.radarService.getRadar(this.radarName).subscribe(data => {
            //    this.radarData = data;
            //    if (data) {
            //        // this.reset();
            //        this.radarName = data.name;
            //        this.description = data.description;
            //        if (Array.isArray(data.quadrants)) {
            //            const quadrants = data.quadrants.filter(quad => quad.quadrantNumber === 3);
            //            if (quadrants.length > 0) {
            //                this.quadrant = quadrants[0];
            //            }
            //        }
            //    };
            //});
        });
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
}

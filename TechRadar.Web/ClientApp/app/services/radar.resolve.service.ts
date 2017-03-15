import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    Router, Resolve,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Radar } from '../models/';
import { RadarService } from './';

@Injectable()
export class RadarResolve implements Resolve<Radar> {
    constructor(private radarService: RadarService, private router: Router) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        let radarName = route.params['name'];
        return this.radarService.getRadar(radarName);
    }
}

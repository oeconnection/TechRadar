import { Http, Response, Headers, RequestOptions, Jsonp } from '@angular/http';
import { Injectable } from '@angular/core';
import { IRadar, Radar, Blip } from '../models';
import { Observable, Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs/Rx';
import { ObjectId } from 'mongodb'

@Injectable()
export class RadarService {
    private baseUrl: string = 'http://w7lriderb:46825/api';
    private blipSubject: Subject<number> = new Subject<number>();

    private dataCache: {
        radarList: Array<Radar>,
        activeBlip: number
    }
    private observable: any;
    private radarObservable: any;

    constructor(private http: Http, private jsonp: Jsonp) {
        this.resetCache();
    }

    private resetCache() {
        this.dataCache = {
            radarList: null,
            activeBlip: null
        }
    }
    private toBlip(item: any): Blip {
        return new Blip(item.id, item.name, item.description, item.size, item.added, item.cycleId, item.quadrantId);
    }

    private mapBlipList(response: Response) {
        // when the cached data is available we don't need the `Observable` reference anymore
        this.observable = null;

        if (response.status == 400) {
            return "FAILURE";
        } else if (response.status == 200) {
            return response.json().map(this.toBlip);
        }
    }

    private toRadar(item: any): Radar {
        var radar = new Radar(item.id, item.code, item.name, item.description, item.quadrants, item.cycles);
        return radar;
    }

    private mapRadarList(response: Response) {
        // when the cached data is available we don't need the `Observable` reference anymore
        this.observable = null;

        if (response.status == 400) {
            return "FAILURE";
        } else if (response.status == 200) {
            this.dataCache.radarList = response.json().map(this.toRadar);
            return this.dataCache.radarList;
        }
    }

    private handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    getRadarList(): Observable<Array<Radar>> {
        console.info("Getting Radars");
        if (this.dataCache.radarList) {
            // if data is available just return it as `Observable`
            return Observable.of(this.dataCache.radarList);
        } else if (this.observable) {
            // if `this.observable` is set then the request is in progress
            // return the `Observable` for the ongoing request
            return this.observable;
        } else {
            // create the request, store the `Observable` for subsequent subscribers
            this.observable = this.http.get(this.baseUrl + '/radar')
                .map((response) => this.mapRadarList(response))
                .share(); // make it shared so more than one subscriber can get the result
            return this.observable;
        }
    }

    private findSingleRadar(radars: Radar[], name: string): Radar {
        return radars.find(x => x.code == name);
    }

    getRadar(name: string): Observable<Radar> {
        return this.getRadarList().map((list) => this.findSingleRadar(list, name));
    }

    getRadarBlips(name: string): Observable<Array<Blip>> {
        return this.http.get(this.baseUrl + '/radar/' + name + '/blips')
            .map((response) => this.mapBlipList(response))
            .share(); 
    }

    getRadarQuadrantBlips(name: string, quadrantNumber: number): Observable<Array<Blip>> {
        console.info("Getting Blips");
        var url = this.baseUrl + '/radar/' + name + '/blips/';
        if (quadrantNumber) {
            url = url + quadrantNumber;
        }

        return this.http.get(url)
            .map((response) => this.mapBlipList(response))
            .share();
    }

    setActiveBlip(blip: number): void {
        this.dataCache.activeBlip = blip;
        this.blipSubject.next(blip);
    }

    getActiveBlip(): Observable<number> {
        return this.blipSubject.asObservable();
    }

    saveRadar(radar: IRadar): Observable<Radar> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const url = `${this.baseUrl}/radar`;
        return this.http.put(url, radar, options)
            .map(() => radar)
            .do(data => {
                this.resetCache();
                console.log('updateRadar: ' + JSON.stringify(data));
            })
            .catch(this.handleError);
    }

    deleteRadar(radar: IRadar): Observable<any> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        if (radar == null) {
            return;
        }

        const url = `${this.baseUrl}/radar/${radar.id}`;
        return this.http.delete(url, options)
            .do(() => {
                this.resetCache();
                console.log('deleteRadar: done');
            })
            .catch(this.handleError);
    }
}

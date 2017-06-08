import { Http, Response, Headers, RequestOptions, Jsonp } from "@angular/http";
import { Injectable } from "@angular/core";
import { IRadar, Radar, Blip, Quadrant, Cycle } from "../../models";
import { Observable, Subject } from "rxjs";
import { environment } from "../../environment"

@Injectable()
export class RadarService {
    private baseUrl = environment.apiRoot;
    private blipSubject = new Subject<number>();

    private dataCache: {
        radarList: Array<Radar>,
        activeBlip: number };

    private observable: any;
    private radarObservable: any;
    private headerOptions = new RequestOptions({ headers: new Headers({ 'Content-Type': "application/json" })});

    constructor(private http: Http, private jsonp: Jsonp) {
        this.resetCache();
    }

    private resetCache() {
        this.dataCache = {
            radarList: null,
            activeBlip: null
        };
    }

    private toBlip(item: any, index: number): Blip {
        const blip = new Blip(item.id, item.name, item.description, item.size, item.added, item.cycleId, item.quadrantId, item.radarId);
        blip.blipNumber = 1; // index + 1;
        return blip;
    }

    private mapBlipList(response: Response) {
        // when the cached data is available we don't need the `Observable` reference anymore
        this.observable = null;

        if (response.status === 200) {
            return response.json().map(this.toBlip);
        }

        return "FAILURE";
    }

    private toRadar(item: any): Radar {
        const radar = new Radar(item.id, item.name, item.sized, item.description, item.quadrants, item.cycles);
        return radar;
    }

    private mapRadarList(response: Response): Radar[] {
        // when the cached data is available we don't need the `Observable` reference anymore
        this.observable = null;

        if (response.status === 200) {
            this.dataCache.radarList = response.json().map(this.toRadar).sort((a: Radar, b: Radar) => {
                if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) return -1;
                if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) return 1;
                return 0;
            });
            return this.dataCache.radarList;
        }

        return null;
    }

    private handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || "";
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ""} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    getRadarList(): Observable<Array<Radar>> {

        if (this.dataCache.radarList) {
            // if data is available just return it as `Observable`
            return Observable.of(this.dataCache.radarList);
        } else if (this.observable) {
            // if `this.observable` is set then the request is in progress
            // return the `Observable` for the ongoing request
            return this.observable;
        } else {
            // create the request, store the `Observable` for subsequent subscribers
            const url = `${this.baseUrl}/radar`;

            this.observable = this.http.get(url, this.headerOptions)
                .map((response: Response) => this.mapRadarList(response))
                .share(); // make it shared so more than one subscriber can get the result
            return this.observable;
        }
    }

    private findSingleRadar(radars: Radar[], id: string): Radar {
        return radars.find(x => x.id === id);
    }

    setActiveBlip(blip: number): void {
        this.dataCache.activeBlip = blip;
        this.blipSubject.next(blip);
    }

    getActiveBlip(): Observable<number> {
        return this.blipSubject.asObservable();
    }

    getRadar(id: string): Observable<Radar> {
        return this.getRadarList().map((list: Radar[]) => this.findSingleRadar(list, id));
    }

    getRadarBlips(id: string): Observable<Array<Blip>> {
        const url = `${this.baseUrl}/radar/${id}/blips`;

        return this.http.get(url, this.headerOptions)
            .map((response: Response) => this.mapBlipList(response))
            .share(); 
    }

    getRadarQuadrantBlips(id: string, quadrantNumber: number): Observable<Array<Blip>> {
        let url = `${this.baseUrl}/radar/${id}/blips`;
        if (quadrantNumber) {
            url = `${url}/${quadrantNumber}`;
        }

        return this.http.get(url, this.headerOptions)
            .map((response: Response) => this.mapBlipList(response))
            .share();
    }

    saveRadar(radar: Radar): Observable<Radar> {
        const url = `${this.baseUrl}/radar`;

        return this.http.put(url, radar, this.headerOptions)
            .map((data: any) => this.toRadar(data.json()))
            .do(() => {
                this.resetCache();
            })
            .catch(this.handleError);
    }

    deleteRadar(radar: IRadar): Observable<any> {
        if (radar == null) {
            return null;
        }

        const url = `${this.baseUrl}/radar/${radar.id}`;
        return this.http.delete(url, this.headerOptions)
            .do(() => {
                this.resetCache();
            })
            .catch(this.handleError);
    }

    saveQuadrantToRadar(radarId: string, quadrant: Quadrant): Observable<Radar> {
        const url = `${this.baseUrl}/radar/${radarId}/quadrant`;

        return this.http.put(url, quadrant, this.headerOptions)
            .map((data: any) => this.toRadar(data.json()))
            .do(() => {
                this.resetCache();
            })
            .catch(this.handleError);
    }

    saveCycleToRadar(radarId: string, cycle: Cycle): Observable<Radar> {
        const url = `${this.baseUrl}/radar/${radarId}/cycle`;

        return this.http.put(url, cycle, this.headerOptions)
            .map((data: any) => this.toRadar(data.json()))
            .do(() => {
                this.resetCache();
            })
            .catch(this.handleError);
    }

    deleteCycleFromRadar(radarId: string, cycleId: string): Observable<Radar> {
        const url = `${this.baseUrl}/radar/${radarId}/cycle/${cycleId}`;

        return this.http.delete(url, this.headerOptions)
            .map((data: any) => this.toRadar(data.json()))
            .do(() => {
                this.resetCache();
            })
            .catch(this.handleError);
    }

    saveBlipToRadar(radarId: string, blip: Blip): Observable<Blip> {
        const url = `${this.baseUrl}/radar/${radarId}/blip`;

        return this.http.put(url, blip, this.headerOptions)
            .map((data: any) => this.toBlip(data.json(), 0))
            .do(() => {
            })
            .catch(this.handleError);
    }

    deleteBlipFromRadar(radarId: string, blipId: string): Observable<Blip> {
        const url = `${this.baseUrl}/radar/${radarId}/blip/${blipId}`;

        return this.http.delete(url, this.headerOptions)
            .map((data: any) => this.toBlip(data.json(), 0))
            .do(() => {
            })
            .catch(this.handleError);
    }
}

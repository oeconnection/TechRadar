import { Component, OnInit, OnDestroy } from "@angular/core";
import { RadarService, GlobalState } from "../../services";
import { Radar } from "../../models";

@Component({
    selector: "home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit, OnDestroy {
    private sub: any;
    private radars: Array<Radar>;
    private readonly radarListDataName = "global.radars";

    constructor(
        private radarService: RadarService,
        private stateManager: GlobalState) {
    }

    ngOnInit() {
        this.stateManager.subscribe(this.radarListDataName, (radars: Radar[]) => {
            this.radars = radars;
        });
    }

    ngOnDestroy(): void {
        if (this.sub !== null && this.sub != undefined) {
            this.sub.unsubscribe();
        }
    }

    isRadarReady(radar: Radar): boolean {
        return !(radar.cycles == null || radar.quadrants == null);
    }

}

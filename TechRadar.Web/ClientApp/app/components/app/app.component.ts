import { Component, OnInit, OnDestroy, OnChanges } from "@angular/core";
import { RadarService, GlobalState } from "../../services";
import { Radar } from "../../models";
import { ImageLoaderService, ThemePreloaderService, ThemeSpinnerService } from "../../services";

@Component({
    selector: "app",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, OnDestroy, OnChanges {
    private sub: any;
    private radars: Array<Radar>;
    private readonly radarListDataName = "global.radars";

    constructor(private radarService: RadarService,
        private imageLoader: ImageLoaderService,
        private spinner: ThemeSpinnerService,
        private stateManager: GlobalState) {

        this.stateManager.subscribe(this.radarListDataName, (radars: Radar[]) => {
            if (radars == null) {
                // reset radar data
                this.sub = this.radarService.getRadarList().subscribe(data => {
                    this.stateManager.notifyDataChanged(this.radarListDataName, data);
                });
            } else {
                // Mouse Over
                this.radars = radars;
            }
        });

    }

    ngOnInit() {
        // First call
        this.stateManager.notifyDataChanged(this.radarListDataName, null);
    }

    ngOnChanges() {
    }

    ngOnDestroy(): void {
        if (this.sub !== null && this.sub !== undefined) {
            this.sub.unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        // hide spinner once all loaders are completed
        ThemePreloaderService.load().then(() => {
            this.spinner.hide();
        });
    }
}

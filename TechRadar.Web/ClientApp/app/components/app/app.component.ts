import { Component, OnInit, OnDestroy, OnChanges } from "@angular/core";
import { RadarService } from "../../services";
import { Radar } from "../../models";
import { ThemePreloaderService, ThemeSpinnerService } from "../../services";

@Component({
    selector: "app",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, OnDestroy, OnChanges {
    private sub: any;
    private radars: Array<Radar>;

    constructor(private radarService: RadarService,
        private spinner: ThemeSpinnerService) {
            this.sub = this.radarService.getRadarList().subscribe(data => {
                this.radars = data;
            });
    }

    ngOnInit() {
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

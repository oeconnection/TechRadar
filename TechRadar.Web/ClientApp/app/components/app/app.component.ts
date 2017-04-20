import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { RadarService } from '../../services';
import { Radar } from '../../models';
import { ImageLoaderService, ThemePreloaderService, ThemeSpinnerService } from '../../services';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    private sub: any;
    private radars: Array<Radar>;

    constructor(private radarService: RadarService,
        private _imageLoader: ImageLoaderService,
        private _spinner: ThemeSpinnerService) {
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
    }

    public ngAfterViewInit(): void {
        // hide spinner once all loaders are completed
        ThemePreloaderService.load().then((values) => {
            this._spinner.hide();
        });
    }
}

import {
    Component,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    ViewChild
} from '@angular/core';

import { ChartCycle, ChartModel, ChartBlip } from '../../../models';

@Component({
    selector: '[radar-blip]',
    templateUrl: './blip.component.html',
    styleUrls: ['./blip.component.css']
})

export class BlipComponent implements OnChanges {
    @Input() model: ChartBlip;
    @ViewChild('g') private container: ElementRef;

    chartBlip: ChartBlip;

    private parentNativeElement: any;

    constructor(element: ElementRef) {
        this.parentNativeElement = element.nativeElement;
    }

    ngOnChanges(): void {
        this.chartBlip = this.model;
    }

    private setupViewModel(): void {
    }
}
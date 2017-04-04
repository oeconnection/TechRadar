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
    styleUrls: ['./blip.component.scss']
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
    
    private showBlip() {
        if (this.chartBlip == null) return false;
        return true;
//        return !isNaN(this.chartBlip.size);
    }

    private showShape(): boolean {
        if (this.chartBlip == null) return false;
        if (this.chartBlip.shape == null) return false;
        if (this.chartBlip.shape.x == null || isNaN(this.chartBlip.shape.x)) return false;
        if (this.chartBlip.shape.y == null || isNaN(this.chartBlip.shape.y)) return false;
        return true;
    }

    private showText(): boolean {
        if (this.chartBlip == null) return false;
        if (this.chartBlip.text == null) return false;
        if (this.chartBlip.text.x == null || isNaN(this.chartBlip.text.x)) return false;
        if (this.chartBlip.text.y == null || isNaN(this.chartBlip.text.y)) return false;
        return true;
    }
}
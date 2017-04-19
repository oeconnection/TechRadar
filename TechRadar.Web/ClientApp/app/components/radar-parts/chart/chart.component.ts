import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    OnInit,
    ElementRef
} from '@angular/core';

import { D3Service, D3 } from 'd3-ng2-service';
import { Radar, Blip } from '../../../models';
import { RadarService } from '../../../services';

@Component({
    selector: 'radar-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss']
})

export class ChartComponent implements OnChanges, OnInit {
    @Input() data: Radar;
    @Input() quadrant: number;
    @Input() width: number;

    private parentNativeElement: any;
    private chartAlignment: string;
    private mouseOnBlip: number;
    private blips: Array<Blip>;
    private show: boolean;

    private quadrantCssClass: string;
    private horizontalLine: { x: number, y: number };
    private titleAnchor: string;
    private titlePosition: { x: number, y: number };
    private translate: { x: number, y: number };
    private verticalLine: { x: number, y: number };

    constructor(private d3Service: D3Service, private radarService: RadarService, private element: ElementRef) {
        this.parentNativeElement = element.nativeElement;

        this.mouseOnBlip = 0;
        this.blips = [];

        this.show = false;
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.setupViewModel();
    }

    private isQuadrantOnly(): boolean {
        if (isNaN(this.quadrant)) return false;

        return this.quadrant > 0;
    }

    private setupViewModel(): void {
        this.show = false;

        this.setProperties();

        this.blips = this.data.blips;

        this.show = true;
    }   

    private setProperties(): void {
        if (this.isQuadrantOnly()) {
            switch (this.quadrant) {
                case 1:
                    this.verticalLine = { x: this.width - 15, y: 0 };
                    this.horizontalLine = { x: 0, y: this.width - 15 };
                    this.quadrantCssClass = 'first';
                    this.titlePosition = { x: 10, y: 10 };
                    this.titleAnchor = 'start';
                    this.chartAlignment = 'text-right';
                    break;

                case 2:
                    this.verticalLine = { x: 0, y: 0 };
                    this.horizontalLine = { x: 0, y: this.width - 15 };
                    this.quadrantCssClass = 'second';
                    this.titlePosition = { x: this.width - 10, y: 10 };
                    this.titleAnchor = 'end';
                    this.chartAlignment = 'text-left';
                    break;

                case 3:
                    this.verticalLine = { x: this.width - 15, y: 0 };
                    this.horizontalLine = { x: 0, y: 0 };
                    this.quadrantCssClass = 'third';
                    this.titlePosition = { x: this.width - 10, y: this.width - 10 };
                    this.titleAnchor = 'end';
                    this.chartAlignment = 'text-left';
                    break;

                case 4:
                    this.verticalLine = { x: this.width - 15, y: 0 };
                    this.horizontalLine = { x: 0, y: 0 };
                    this.quadrantCssClass = 'fourth';
                    this.titlePosition = { x: 10, y: this.width - 10 };
                    this.titleAnchor = 'start';
                    this.chartAlignment = 'text-right';
                    break;
            }
        } else {
            this.verticalLine = { x: (this.width / 2) - 15, y: 0 };
            this.horizontalLine = { x: 0, y: (this.width / 2) };
            this.quadrantCssClass = 'fourth';
            this.titlePosition = { x: 10, y: this.width - 10 };
            this.titleAnchor = 'start';
            this.chartAlignment = 'text-center';
        }
    }

 
}
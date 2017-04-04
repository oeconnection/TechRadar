import { Component, Input, OnChanges } from '@angular/core';
import { Radar } from '../../models';

@Component({
    selector: 'nav-menu',
    templateUrl: './navmenu.component.html',
    styleUrls: ['./navmenu.component.scss']
})
export class NavMenuComponent implements OnChanges {
    @Input() radars: Array<Radar>;

    private logoImageUrl: string;

    constructor() {
        this.logoImageUrl = require('../../../assets/images/radar-logo.png');
    }

    ngOnChanges() {
    }
}

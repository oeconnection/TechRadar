import { Injectable } from '@angular/core';

@Injectable()
export class ThemeSpinnerService {

    private _selector: string = 'preloader';
    private _element: HTMLElement;

    constructor() {
        this._element = document.getElementById(this._selector);
    }

    public show(): void {
        debugger;
        this._element.style['display'] = 'block';
    }

    public hide(delay: number = 0): void {
        setTimeout(() => {
            this._element.style['display'] = 'none';
        }, delay);
    }
}

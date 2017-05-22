import { Injectable } from "@angular/core";

@Injectable()
export class ThemeSpinnerService {

    private selector: string = "preloader";
    private element: HTMLElement;

    constructor() {
        this.element = document.getElementById(this.selector);
    }

    show(): void {
        this.element.style["display"] = "block";
    }

    hide(delay: number = 0): void {
        setTimeout(() => {
                this.element.style["display"] = "none";
            },
            delay);
    }
}
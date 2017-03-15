import {
    Directive,
    Renderer,
    HostListener,
    HostBinding,
    ElementRef,
    Input,
    EventEmitter
} from '@angular/core';

@Directive({
    selector: "[opacity-changer]"
})
export class OpacityChangerDirective {
    @HostBinding('class.blip-group') private ishovering: boolean;

    @Input('opacityChanger') config: {
        querySelector: '.blip-group'
    };

    constructor(private el: ElementRef,
        private renderer: Renderer) {
    }

    @HostListener('mouseover') onMouseOver() {
        let part = this.el.nativeElement.querySelector(this.config.querySelector);
//        this.renderer.setElementStyle(part, 'display', 'block');
        this.ishovering = true;
        console.debug("Hovering: %s", this.ishovering);
    }

    @HostListener('mouseout') onMouseOut() {
        let part = this.el.nativeElement.querySelector(this.config.querySelector);
        this.renderer.setElementStyle(part, 'display', 'none');
        this.ishovering = false;
        console.debug("Stop Hovering: %s", this.ishovering);
    }
}
import { Component } from '@angular/core';

import { DefaultEditor } from 'ng2-smart-table';

@Component({
    template: `
    <input [ngClass]="inputClass"
           type="number"
           class="form-control"
           [name]="cell.getId()"
           [(ngModel)]="cell.newValue"
           [placeholder]="cell.getTitle()"
           [disabled]="!cell.isEditable()"
           (click)="onClick.emit($event)"
           (keydown.enter)="onEdited.emit($event)"
           (keydown.esc)="onStopEditing.emit()">
    `
})
export class NumericEditorComponent extends DefaultEditor {

    constructor() {
        super();
    }
}
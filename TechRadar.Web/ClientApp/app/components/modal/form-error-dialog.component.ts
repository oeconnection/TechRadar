import { Component } from "@angular/core";
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";

export interface IFormErrorDialogModel {
    title: string;
    messages: string[];
}

@Component({
    selector: "confirm",
    template: `<div class="modal-dialog">
                <div class="modal-content">
                   <div class="modal-header">
                     <button type="button" class="close" (click)="close()" >&times;</button>
                     <h4 class="modal-title">{{title || 'Errors'}}</h4>
                   </div>
                   <div class="modal-body">
                     <p *ngFor="let message of messages">{{message}}</p>
                   </div>
                   <div class="modal-footer">
                     <button type="button" class="btn btn-danger" (click)="confirm()">OK</button>
                   </div>
                 </div>
                </div>`
})
export class FormErrorDialogComponent extends DialogComponent<IFormErrorDialogModel, boolean> implements IFormErrorDialogModel {
    title: string;
    messages: string[];

    constructor(dialogService: DialogService) {
        super(dialogService);
    }
    confirm() {
        this.result = true;
        this.close();
    }
}

﻿import { Component } from "@angular/core";
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";

export interface IConfirmModel {
    title: string;
    message: string;
}

@Component({
    selector: "confirm",
    template: `<div class="modal-dialog">
                <div class="modal-content">
                   <div class="modal-header">
                     <button type="button" class="close" (click)="close()" >&times;</button>
                     <h4 class="modal-title">{{title || 'Confirm'}}</h4>
                   </div>
                   <div class="modal-body">
                     <p>{{message || 'Are you sure?'}}</p>
                   </div>
                   <div class="modal-footer">
                     <button type="button" class="btn btn-primary" (click)="confirm()">OK</button>
                     <button type="button" class="btn btn-default" (click)="cancel()">Cancel</button>
                   </div>
                 </div>
                </div>`
})
export class ConfirmDialogComponent extends DialogComponent<IConfirmModel, boolean> implements IConfirmModel {
    title: string;
    message: string;
    constructor(dialogService: DialogService) {
        super(dialogService);
    }
    confirm() {
        this.result = true;
        this.close();
    }
    cancel() {
        this.result = false;
        this.close();
    }
}

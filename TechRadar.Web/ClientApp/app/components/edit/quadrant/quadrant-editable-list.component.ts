import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from "@angular/core";
import { DialogService } from "ng2-bootstrap-modal";
import { FormErrorDialogComponent } from "../../modal"
import { Quadrant } from "../../../models";
import { LocalDataSource } from "ng2-smart-table";

@Component({
    selector: "quadrant-editable-list",
    template: `<ng2-smart-table [settings]="settings" [source]="source" (editConfirm)="onSaveConfirmEvent($event)" ></ng2-smart-table>`,
    styleUrls: ["./quadrant-editable-list.component.scss"]
})
export class QuadrantEditableListComponent implements OnInit, OnChanges {
    @Input()
    quadrants: Quadrant[];

    @Output()
    quadrantSaveEvent = new EventEmitter<Quadrant>();

    source: LocalDataSource;
    settings = {};

    private validationMessages: { [key: string]: { [key: string]: string } } = {
        name: {
            required: "Quadrant name is required.",
            minlength: "Quadrant name must be at least three characters."
        }
    };

    constructor(private dialogService: DialogService) {
    }

    ngOnInit(): void {
        this.setTableSettings();
    }

    ngOnChanges(): void {
        this.source = new LocalDataSource(this.quadrants);
    }

    private setTableSettings() {
        this.settings = {
            mode: "inline",
            hideSubHeader: true,
            attr: {
                class: "table table-striped"
            },
            actions: {
                add: false,
                delete: false,
                edit: true,
                position: "right"
            },
            edit: {
                confirmSave: true,
                editButtonContent: `<div class="btn btn-xs btn-primary"><i class="fa fa-pencil-square-o"></i></div>`,
                cancelButtonContent: `<div class="btn btn-xs btn-default"><i class="fa fa-remove"></i></div>`,
                saveButtonContent: `<div class="btn btn-xs btn-info"><i class="fa fa-check"></i></button>`
            },
            columns: {
                quadrantNumber: {
                    title: "Quadrant #",
                    editable: false,
                    class: "col-md-1"
                },
                name: {
                    title: "Name",
                    editable: true,
                    class: "col-md-4"
                },
                description: {
                    title: "Description",
                    editable: true,
                    class: "col-md-6"
                }
            },
            pager: {
                display: false
    }
        };

    }

    private validateForm(data: any): string[] {
        const errorMessages = new Array<string>();

        if (data.name == undefined || data.name.length === 0) {
            errorMessages.push(this.validationMessages["name"]["required"]);
        }

        if (data.name.length < 2) {
            errorMessages.push(this.validationMessages["name"]["minlength"]);
        }

        return errorMessages;
    }

    onSaveConfirmEvent(event) {
        const messages = this.validateForm(event.newData);
        if (messages.length === 0) {
            let newItem = new Quadrant(event.newData);
            this.quadrantSaveEvent.emit(newItem);
            event.confirm.resolve(newItem);
        } else {
            this.dialogService.addDialog(FormErrorDialogComponent,
                {
                    title: "Errors Found",
                    messages: messages
                });
        }
    }
}
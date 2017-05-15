import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ViewEncapsulation } from "@angular/core";
import { DialogService } from "ng2-bootstrap-modal";
import { FormErrorDialogComponent, ConfirmDialogComponent } from "../../modal"
import { Cycle, Blip } from "../../../models";
import { LocalDataSource } from "ng2-smart-table";
import { NumericEditorComponent } from "../../grid-editors"
@Component({
    selector: "cycle-editable-list",
    template: `<ng2-smart-table [settings]="settings" [source]="source" 
                        (createConfirm)="onCreateConfirmEvent($event)"
                        (deleteConfirm)="onDeleteConfirmEvent($event)"
                        (editConfirm)="onSaveConfirmEvent($event)"
                        ></ng2-smart-table>`,
    styleUrls: ["./cycle-editable-list.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class CycleEditableListComponent implements OnInit, OnChanges {
    @Input()
    cycles: Cycle[];

    @Input()
    blips: Blip[];

    @Output()
    cycleSaveEvent = new EventEmitter<Cycle>();

    @Output()
    cycleDeleteEvent = new EventEmitter<Cycle>();

    source: LocalDataSource;
    settings = {};


    private newCycleId = "newid";

    private validationMessages: { [key: string]: { [key: string]: string } } = {
        name: {
            required: "Cycle name is required.",
            minlength: "Cycle name must be at least three characters.",
            maxlength: "Cycle name must not be more than 15 characters."
        },
        fullName: {
            required: "Cycle full name is required.",
            minlength: "Cycle full name must be at least three characters."
        },
        order: {
            required: "Cycle order is required and must be a number.",
            min: "Cycle order must be at least zero."
        },
        size: {
            required: "Ring size is required and must be a number.",
            min: "Ring size must be at least zero."
        },
        id: {
            exists: "Cannot delete cycle while in use."
        }
    };

    constructor(private dialogService: DialogService) {
    }

    ngOnInit(): void {
        this.setTableSettings();
    }
    ngOnChanges(): void {
        this.source = new LocalDataSource(this.cycles);
    }

    private setTableSettings() {
        this.settings = {
            mode: "inline",
            attr: {
                class: "table table-striped"
            },
            actions: {
                position: "right"
            },
            edit: {
                confirmSave: true,
                editButtonContent: `<div class="btn btn-xs btn-primary"><i class="fa fa-pencil-square-o"></i></div>`,
                cancelButtonContent: `<div class="btn btn-xs btn-default"><i class="fa fa-remove"></i></div>`,
                saveButtonContent: `<div class="btn btn-xs btn-info"><i class="fa fa-check"></i></button>`
            },
            delete: {
                confirmDelete: true,
                deleteButtonContent: `<div class="btn btn-xs btn-danger"><i class="fa fa-trash"></i></button>`
            },
            add: {
                confirmCreate: true,
                addButtonContent: `<div class="btn btn-xs btn-primary"><i class="fa fa-plus"></i> Add New</button>`,
                createButtonContent: `<div class="btn btn-xs btn-info"><i class="fa fa-check"></i></button>`,
                cancelButtonContent: `<div class="btn btn-xs btn-default"><i class="fa fa-remove"></i></div>`
            },
            columns: {
                order: {
                    title: "Order",
                    type: "html",
                    editor: {
                        type: "custom",
                        component: NumericEditorComponent
                    },
                    class: "col-md-1"
                },
                name: {
                    title: "Axis Name",
                    editable: true,
                    class: "col-md-2"
                },
                fullName: {
                    title: "Full Name",
                    editable: true,
                    class: "col-md-2"
                },
                description: {
                    title: "Description",
                    editable: true,
                    class: "col-md-5"
                },
                size: {
                    title: "Ring Size (%)",
                    editable: true,
                    type: "html",
                    editor: {
                        type: "custom",
                        component: NumericEditorComponent
                    },
                    class: "col-md-1"
                }
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

        if (data.name.length > 15) {
            errorMessages.push(this.validationMessages["name"]["maxlength"]);
        }

        if (data.order == undefined || isNaN(data.order)) {
            errorMessages.push(this.validationMessages["order"]["required"]);
        }

        if (data.order < 0) {
            errorMessages.push(this.validationMessages["order"]["min"]);
        }

        if (data.size == undefined || isNaN(data.size)) {
            errorMessages.push(this.validationMessages["size"]["required"]);
        }

        if (data.size < 0) {
            errorMessages.push(this.validationMessages["size"]["min"]);
        }

        return errorMessages;
    }

    private validateDelete(data: any): string[] {
        const errorMessages = new Array<string>();

        if (data == null) {
            return errorMessages;
        }

        if (data.id === undefined || data.id === "") {
            return errorMessages;
        }

        const blipInUse = this.blips.find(blip => blip.cycleId === data.id);

        if (blipInUse !== undefined) {
            errorMessages.push(this.validationMessages["id"]["exists"]);
        }
        return errorMessages;
    }

    onSaveConfirmEvent(event) {
        const messages = this.validateForm(event.newData);
        if (messages.length === 0) {
            const newItem = new Cycle(event.newData);
            this.cycleSaveEvent.emit(newItem);
            event.confirm.resolve(newItem);
        } else {
            this.dialogService.addDialog(FormErrorDialogComponent,
                {
                    title: "Errors Found",
                    messages: messages
                });
        }
    }

    onDeleteConfirmEvent(event, cycle) {
        const item = event.data;
        const messages = this.validateDelete(item);
        if (messages.length === 0) {
            this.dialogService.addDialog(ConfirmDialogComponent,
                    {
                        title: "Confirmation",
                        message: `Delete cycle ${item.name}?`
                    })
                .subscribe((isConfirmed) => {
                    if (isConfirmed) {
                        this.cycleDeleteEvent.emit(item);
                    }
                });
        } else {
            this.dialogService.addDialog(FormErrorDialogComponent,
                {
                    title: "Errors Found",
                    messages: messages
                });
        }
    }

    onCreateConfirmEvent(event) {
        const messages = this.validateForm(event.newData);
        if (messages.length === 0) {
            let newItem = new Cycle(event.newData);
            this.cycleSaveEvent.emit(newItem);
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
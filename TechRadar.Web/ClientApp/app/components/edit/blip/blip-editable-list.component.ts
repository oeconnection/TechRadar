import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ViewEncapsulation } from "@angular/core";
//import "rxjs/add/operator/debounceTime";
//import "rxjs/add/observable/fromEvent";
//import "rxjs/add/observable/merge";
import { isNumeric } from "rxjs/util/isNumeric";
import { Radar, Cycle, Quadrant, Blip, IListItem } from "../../../models";
import { DialogService } from "ng2-bootstrap-modal";
import { ConfirmDialogComponent, FormErrorDialogComponent } from "../../modal"
//import * as _ from "underscore";
import { LocalDataSource } from "ng2-smart-table";

@Component({
    selector: "blip-editable-list",
    template: `<ng2-smart-table [settings]="settings"
                         [source]="source"
                         (createConfirm)="onCreateConfirmEvent($event)"
                         (deleteConfirm)="onDeleteConfirmEvent($event)"
                         (editConfirm)="onSaveConfirmEvent($event)"
                         ></ng2-smart-table>`,
    styleUrls: ["./blip-editable-list.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class BlipEditableListComponent implements OnInit, OnChanges {
    @Input()
    blips: Blip[];

    @Input()
    radar: Radar;

    @Input()
    sized: boolean;

    @Output()
    blipSaveEvent = new EventEmitter<Blip>();

    @Output()
    blipDeleteEvent = new EventEmitter<Blip>();

    source: LocalDataSource;
    settings = {};
    confirmResult: boolean = null;
    private cycleList = new Array<IListItem>();
    private quadrantList = new Array<IListItem>();
    private usageSizeList = new Array<IListItem>();
    private validationMessages: { [key: string]: { [key: string]: string } } = {
        name: {
            required: "Blip name is required.",
            minlength: "Blip name must be at least two characters."
        },
        size: {
            required: "Size is required.",
            number: "Size must be a number.",
            range: "Size must be a number between 1 and 5."
        },
        cycleId: {
            required: "Cycle is required."
        },
        quadrantId: {
            required: "Quadrant is required."
        }
    };

    constructor(private dialogService: DialogService) {
    }

    ngOnInit(): void {
        this.setTableSettings();
    }

    ngOnChanges(): void {
        this.source = new LocalDataSource(this.blips);
        this.setTableSettings();
    }

    private buildLists() {
        this.cycleList = new Array<IListItem>();
        this.radar.cycles.forEach((cycle: Cycle) => {
            this.cycleList.push({ value: cycle.id, title: cycle.fullName });
        });

        this.quadrantList = new Array<IListItem>();
        this.radar.quadrants.forEach((quadrant: Quadrant) => {
            this.quadrantList.push({ value: quadrant.id, title: quadrant.name });
        });

        this.usageSizeList = [
            { value: 1, title: "1 - Minimal Usage" },
            { value: 2, title: "2" },
            { value: 3, title: "3" },
            { value: 4, title: "4" },
            { value: 5, title: "5 - Widely used" }
        ];

    }

    private setTableSettings() {
        this.buildLists();

        const editAction = {
            confirmSave: true,
            editButtonContent: `<div class="btn btn-xs btn-primary"><i class="fa fa-pencil-square-o"></i></div>`,
            cancelButtonContent: `<div class="btn btn-xs btn-default"><i class="fa fa-remove"></i></div>`,
            saveButtonContent: `<div class="btn btn-xs btn-info"><i class="fa fa-check"></i></button>`
        };

        const deleteAction = {
            confirmDelete: true,
            deleteButtonContent: `<div class="btn btn-xs btn-danger"><i class="fa fa-trash"></i></button>`
        }

        const createAction = {
            confirmCreate: true,
            addButtonContent: `<div class="btn btn-xs btn-primary"><i class="fa fa-plus"></i> Add New</button>`,
            createButtonContent: `<div class="btn btn-xs btn-info"><i class="fa fa-check"></i></button>`,
            cancelButtonContent: `<div class="btn btn-xs btn-default"><i class="fa fa-remove"></i></div>`
        }

        const nameField = {
            title: "Name",
            editable: true,
            class: "col-md-3"
        };

        const descriptionField = {
            title: "Description",
            editable: true,
            class: "col-md-3"
        };

        const cycleIdField = {
            title: "Cycle",
            editable: true,
            type: "html",
            editor: {
                type: "list",
                config: {
                    list: this.cycleList
                }
            },
            valuePrepareFunction: (value) => {
                let display = value;

                this.cycleList.forEach((item) => {
                    if (item.value === value) {
                        display = item.title;
                    }

                });
                return display;
            },
            filter: {
                type: "list",
                config: {
                    selectText: "Select Cycle...",
                    list: this.cycleList
                }
            },
            class: "col-md-2"
        };

        const quadrantIdField = {
            title: "Quadrant",
            editable: true,
            type: "html",
            editor: {
                type: "list",
                config: {
                    list: this.quadrantList
                }
            },
            valuePrepareFunction: (value) => {
                let display = value;

                this.quadrantList.forEach((item) => {
                    if (item.value === value) {
                        display = item.title;
                    }

                });
                return display;
            },
            filter: {
                type: "list",
                config: {
                    selectText: "Select Quadrant...",
                    list: this.quadrantList
                }
            },
            class: "col-md-2"
        };

        const sizeField = {
            title: "Usage",
                class: "col-md-1",
                editable: true,
                type: "html",
                editor: {
                type: "list",
                    config: {
                    list: this.usageSizeList
                }
            },
            valuePrepareFunction: (value) => {
                    let display = value;

                    this.usageSizeList.forEach((item) => {
                        if (item.value === value) {
                            display = item.title;
                        }

                    });
                    return display;
                },
                filter: {
                type: "list",
                    config: {
                    selectText: "Select...",
                        list: this.usageSizeList
                }
            }
        }

        if (this.sized) {
            this.settings = {
                mode: "inline",
                attr: {
                    class: "table table-striped"
                },
                actions: {
                    position: "right"
                },
                edit: editAction,
                delete: deleteAction,
                add: createAction,

                columns: {
                    name: nameField,
                    description: descriptionField,
                    cycleId: cycleIdField,
                    quadrantId: quadrantIdField,
                    size: sizeField
                }
            };
        } else {
            this.settings = {
                mode: "inline",
                attr: {
                    class: "table table-striped"
                },
                actions: {
                    position: "right"
                },
                edit: editAction,
                delete: deleteAction,
                add: createAction,

                columns: {
                    name: nameField,
                    description: descriptionField,
                    cycleId: cycleIdField,
                    quadrantId: quadrantIdField
                }
            };
        }
    }

    private validateForm(data: any): string[] {
        const errorMessages = new Array<string>();

        if (data.name == undefined || data.name.length === 0) {
            errorMessages.push(this.validationMessages["name"]["required"]);
        }

        if (data.name.length < 2) {
            errorMessages.push(this.validationMessages["name"]["minlength"]);
        }

        if (this.sized) {
            if (data.size == undefined) {
                errorMessages.push(this.validationMessages["size"]["required"]);
            }

            if (!isNumeric(data.size)) {
                errorMessages.push(this.validationMessages["size"]["number"]);
            }
        }

        if (data.cycleId == undefined || data.cycleId.length === 0) {
            errorMessages.push(this.validationMessages["cycleId"]["required"]);
        }

        if (data.quadrantId == undefined || data.quadrantId.length === 0) {
            errorMessages.push(this.validationMessages["quadrantId"]["required"]);
        }

        return errorMessages;
    }

    private objectToBlip(data: any): Blip {
        const newData = data;

        let size = 1;
        if (this.sized) {
            size = parseInt(newData.size);
        }

        return new Blip(
            data.id,
            data.name,
            data.description,
            size,
            new Date(),
            data.cycleId,
            data.quadrantId,
            this.radar.id);
    }

    onSaveConfirmEvent(event) {
        const messages = this.validateForm(event.newData);
        if (messages.length === 0) {
            let newBlip = this.objectToBlip(event.newData);
            this.blipSaveEvent.emit(newBlip);
            event.confirm.resolve(newBlip);
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
            let newBlip = this.objectToBlip(event.newData);
            this.blipSaveEvent.emit(newBlip);
            event.confirm.resolve(newBlip);
        } else {
            this.dialogService.addDialog(FormErrorDialogComponent,
                {
                    title: "Errors Found",
                    messages: messages
                });
        }
    }

    onDeleteConfirmEvent(event) {
        const blip = event.data;
        this.dialogService.addDialog(ConfirmDialogComponent,
                {
                    title: "Confirmation",
                    message: `Delete blip ${blip.name}?`
                })
            .subscribe((isConfirmed) => {
                if (isConfirmed) {
                    this.blipDeleteEvent.emit(blip);
                }
            });
    }
}
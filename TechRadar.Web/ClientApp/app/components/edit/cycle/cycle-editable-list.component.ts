import { Component, OnInit, ViewChildren, ElementRef, ViewContainerRef, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, FormControlName } from '@angular/forms';
import { ToastsManager, Toast } from 'ng2-toastr/ng2-toastr';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Radar, Cycle } from '../../../models';
import * as _ from 'underscore';
import { GenericValidator } from '../../../shared';
import { CustomValidators } from 'ng2-validation';
import { DialogService } from "ng2-bootstrap-modal";
import { ConfirmDialogComponent } from '../../modal'

@Component({
    selector: 'cycle-editable-list',
    templateUrl: './cycle-editable-list.component.html'
})
export class CycleEditableListComponent implements OnInit, AfterViewInit {
    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    @Input() cycles: Cycle[];
    @Output() cycleSaveEvent = new EventEmitter<Cycle>();
    @Output() cycleDeleteEvent = new EventEmitter<Cycle>();

    errorMessage: string;
    cycleForm: FormGroup;

    displayMessage: { [key: string]: string } = {};
    cycleInEditMode: string;

    private newCycleId: string = 'newid';

    private validationMessages: { [key: string]: { [key: string]: string } } = {
        name: {
            required: 'Cycle name is required.',
            minlength: 'Cycle name must be at least three characters.'
        },
        fullName: {
            required: 'Cycle full name is required.',
            minlength: 'Cycle full name must be at least three characters.'
        },
        order: {
            required: 'Cycle order is required.',
            minlength: 'Cycle full name must be at least three characters.'
        }
    };

    genericValidator: GenericValidator;
    confirmResult: boolean = null;

    constructor(private fb: FormBuilder,
        private toastr: ToastsManager,
        private vcr: ViewContainerRef,
        private dialogService: DialogService
    ) {
        this.toastr.setRootViewContainerRef(vcr);
        this.genericValidator = new GenericValidator(this.validationMessages);
        this.cycleInEditMode = '';
    }

    ngOnInit(): void {
        this.buildForm();
    }

    ngAfterViewInit(): void {
        // Watch for the blur event from any input element on the form.
        let controlBlurs: Observable<any>[] = this.formInputElements
            .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

        // Merge the blur event observable with the valueChanges observable
        Observable.merge(this.cycleForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
            this.displayMessage = this.genericValidator.processMessages(this.cycleForm);
        });
    }

    private buildForm() {
        this.cycleForm = this.fb.group({
            id: '',
            name: ['', [
                Validators.required,
                Validators.minLength(3)
            ]],
            fullName: ['', [
                Validators.required,
                Validators.minLength(3)
            ]],
            order: ['', [
                Validators.required,
                CustomValidators.min(0)
            ]],
            size: ['', [
                Validators.required,
                CustomValidators.number
            ]],
            description: ''
        });

    }

    isEditing(id: string) {
        if (this.cycleInEditMode == '') return false;

        return this.cycleInEditMode == id;
    }

    isEditingInProgress() {
        return this.cycleInEditMode != '';
    }

    private findCycleById(id: string): Cycle {
        var list = this.cycles.filter(cycle => _.isEqual(cycle.id, id));

        if (Array.isArray(list) && list.length > 0) {
            return (list[0]);
        }

        return null;
    }

    private setFormForRow(id) {
        this.cycleForm.reset();

        var cycle = this.findCycleById(id);

        if (cycle != undefined) {
            this.cycleForm.patchValue({
                id: cycle.id,
                name: cycle.name,
                fullName: cycle.fullName,
                order: cycle.order,
                description: cycle.description,
                size: cycle.size
            });
        }

        this.cycleInEditMode = id;
    }

    onCycleEditClicked(event, id: string) {
        this.setFormForRow(id);
    }

    onCycleSaveClicked(event) {
        this.saveCycle();

        this.cycleInEditMode = '';
    }

    onCycleDeleteClicked(event, cycle) {
        this.dialogService.addDialog(ConfirmDialogComponent, {
            title: 'Confirmation',
            message: `Delete cycle ${cycle.name}?`
        })
            .subscribe((isConfirmed) => {
                if (isConfirmed) {
                    this.deleteCycle(cycle);
                }
            });

        this.cycleInEditMode = '';
    }

    onCycleCancelClicked(event, id: string) {
        if (id === this.newCycleId) {
            var cycle = this.findCycleById(id);

            var index: number = this.cycles.indexOf(cycle);
            if (index > -1) {
                this.cycles.splice(index, 1);
            }
        }
        this.cycleForm.reset();
        this.cycleInEditMode = '';
    }

    addCycle() {
        this.cycles.splice(0, 0, new Cycle({
            id: this.newCycleId,
            name: 'New',
            fullName: 'Enter a more detailed title here',
            description: 'Enter an explanation here',
            order: 0,
            size: 10
        }))

        this.setFormForRow(this.newCycleId);
    }

    saveCycle(): void {
        var cycle: Cycle;
        if (this.cycleForm.dirty && this.cycleForm.valid) {
            let p = Object.assign({}, cycle, this.cycleForm.value);

            if (p.id == this.newCycleId) {
                p.id = null;
            }

            this.cycleSaveEvent.emit(p);
        } else if (!this.cycleForm.dirty) {
            this.onSaveComplete(null);
        }
    }

    deleteCycle(cycle: Cycle): void {
        var cycle: Cycle;
        this.cycleDeleteEvent.emit(cycle);
        this.onDeleteComplete();
    }

    onSaveComplete(cycle: Cycle): void {
        // Reset the form to clear the flags
        this.cycleForm.reset();
    }

    onDeleteComplete(): void {
        this.toastr.success('Cycle deletion successful');
    }
}

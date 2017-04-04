import { Component, OnInit, ViewChildren, ElementRef, ViewContainerRef, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, FormControlName } from '@angular/forms';
import { ToastsManager, Toast } from 'ng2-toastr/ng2-toastr';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Radar, Blip } from '../../../models';
import * as _ from 'underscore';
import { GenericValidator } from '../../../shared';
import { CustomValidators } from 'ng2-validation';
import { DialogService } from "ng2-bootstrap-modal";
import { ConfirmDialogComponent } from '../../modal'

@Component({
    selector: 'blip-editable-list',
    templateUrl: './blip-editable-list.component.html'
})
export class BlipEditableListComponent implements OnInit, AfterViewInit {
    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    @Input() blips: Blip[];
    @Input() radar: Radar;
    @Output() blipSaveEvent = new EventEmitter<Blip>();
    @Output() blipDeleteEvent = new EventEmitter<Blip>();

    errorMessage: string;
    blipForm: FormGroup;

    displayMessage: { [key: string]: string } = {};
    blipInEditMode: string;

    private newBlipId: string = 'newid';

    private validationMessages: { [key: string]: { [key: string]: string } } = {
        name: {
            required: 'Blip name is required.',
            minlength: 'Blip name must be at least two characters.'
        },
        size: {
            required: 'Size is required.',
            number: 'Size must be a number.',
            range: 'Size must be a number between 1 and 5.'
        },
        cycleId: {
            required: 'Cycle is required.'
        },
        quadrantId: {
            required: 'Cycle is required.'
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
        this.blipInEditMode = '';
    }

    ngOnInit(): void {
        this.buildForm();
    }

    ngAfterViewInit(): void {
        // Watch for the blur event from any input element on the form.
        let controlBlurs: Observable<any>[] = this.formInputElements
            .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

        // Merge the blur event observable with the valueChanges observable
        Observable.merge(this.blipForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
            this.displayMessage = this.genericValidator.processMessages(this.blipForm);
        });
    }

    private buildForm() {
        this.blipForm = this.fb.group({
            id: '',
            name: ['', [
                Validators.required,
                Validators.minLength(2)
            ]],
            size: ['', [
                Validators.required,
                CustomValidators.number,
                CustomValidators.range([1,5])
            ]],
            cycleId: ['', [
                Validators.required
            ]],
            quadrantId: ['', [
                Validators.required
            ]],
            description: ''
        });

    }

    isEditing(id: string) {
        if (this.blipInEditMode == '') return false;

        return this.blipInEditMode == id;
    }

    isEditingInProgress() {
        return this.blipInEditMode != '';
    }

    private findBlipById(id: string): Blip {
        var list = this.blips.filter(blip => _.isEqual(blip.id, id));

        if (Array.isArray(list) && list.length > 0) {
            return (list[0]);
        }

        return null;
    }

    private setFormForRow(id) {
        this.blipForm.reset();

        var blip = this.findBlipById(id);

        if (blip != undefined) {
            this.blipForm.patchValue({
                id: blip.id,
                name: blip.name,
                description: blip.description,
                size: blip.size,
                cycleId: blip.cycleId,
                quadrantId: blip.quadrantId
            });
        }

        this.blipInEditMode = id;
    }

    getCycleName(id: string) {
        let cycle = this.radar.cycles.find(x => x.id == id);

        return (cycle == undefined) ? '' : cycle.name;
    }

    getQuadrantName(id: string) {
        let quadrant = this.radar.quadrants.find(x => x.id == id);

        return (quadrant == undefined) ? '' : quadrant.name;
    }

    onBlipEditClicked(event, id: string) {
        this.setFormForRow(id);
    }

    onBlipSaveClicked(event) {
        this.saveBlip();

        this.blipInEditMode = '';
    }

    onBlipDeleteClicked(event, blip) {
        this.dialogService.addDialog(ConfirmDialogComponent, {
            title: 'Confirmation',
            message: `Delete blip ${blip.name}?`
        })
            .subscribe((isConfirmed) => {
                if (isConfirmed) {
                    this.deleteBlip(blip);
                }
            });

        this.blipInEditMode = '';
    }

    onBlipCancelClicked(event, id: string) {
        if (id === this.newBlipId) {
            var blip = this.findBlipById(id);

            var index: number = this.blips.indexOf(blip);
            if (index > -1) {
                this.blips.splice(index, 1);
            }
        }
        this.blipForm.reset();
        this.blipInEditMode = '';
    }

    addBlip() {
        this.blips.splice(0, 0, new Blip(
            this.newBlipId,
            'New',
            'Enter an explanation here',
            10,
            null,
            '',
            '',
            this.radar.id
        ));

        this.setFormForRow(this.newBlipId);
    }

    saveBlip(): void {
        var blip: Blip;
        if (this.blipForm.dirty && this.blipForm.valid) {
            let p = Object.assign({}, blip, this.blipForm.value);

            if (p.id == this.newBlipId) {
                p.id = null;
            }

            p.radarId = this.radar.id;

            this.blipSaveEvent.emit(p);
        } else if (!this.blipForm.dirty) {
            this.onSaveComplete(null);
        }
    }

    deleteBlip(blip: Blip): void {
        var blip: Blip;
        this.blipDeleteEvent.emit(blip);
        this.onDeleteComplete();
    }

    onSaveComplete(blip: Blip): void {
        // Reset the form to clear the flags
        this.blipForm.reset();
    }

    onDeleteComplete(): void {
        this.toastr.success('Blip deletion successful');
    }
}

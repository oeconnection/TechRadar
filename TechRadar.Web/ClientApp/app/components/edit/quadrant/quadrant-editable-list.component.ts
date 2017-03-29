import { Component, OnInit, ViewChildren, ElementRef, ViewContainerRef, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, FormControlName } from '@angular/forms';
import { ToastsManager, Toast } from 'ng2-toastr/ng2-toastr';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Radar, Quadrant, Cycle } from '../../../models';
import * as _ from 'underscore';
import { GenericValidator } from '../../../shared';

@Component({
    selector: 'quadrant-editable-list',
    templateUrl: './quadrant-editable-list.component.html'
})
export class QuadrantEditableListComponent implements OnInit, AfterViewInit {
    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    @Input() quadrants: Quadrant[];
    @Output() quadrantSaveEvent = new EventEmitter<Quadrant>();

    errorMessage: string;
    quadrantForm: FormGroup;

    displayMessage: { [key: string]: string } = {};
    quadrantInEditMode: string;

    private validationMessages: { [key: string]: { [key: string]: string } } = {
        name: {
            required: 'Quadrant name is required.',
            minlength: 'Quadrant name must be at least three characters.'
        }
    };

    genericValidator: GenericValidator;

    constructor(private fb: FormBuilder,
        private toastr: ToastsManager,
        private vcr: ViewContainerRef
    ) {
        this.toastr.setRootViewContainerRef(vcr);
        this.genericValidator = new GenericValidator(this.validationMessages);
        this.quadrantInEditMode = '';
    }

    ngOnInit(): void {
        this.buildForm();
    }

    ngAfterViewInit(): void {
        // Watch for the blur event from any input element on the form.
        let controlBlurs: Observable<any>[] = this.formInputElements
            .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

        // Merge the blur event observable with the valueChanges observable
        Observable.merge(this.quadrantForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
            this.displayMessage = this.genericValidator.processMessages(this.quadrantForm);
        });
    }

    private buildForm() {
        this.quadrantForm = this.fb.group({
            id: '',
            quadrantNumber: 1,
            name: ['', [
                Validators.required,
                Validators.minLength(3)
            ]],
            description: ''
        });

    }

    isEditing(id: string) {
        if (this.quadrantInEditMode == '') return false;

        return this.quadrantInEditMode == id;
    }

    isEditingInProgress() {
        return this.quadrantInEditMode != '';
    }

    private findQuadrantById(id: string): Quadrant {
        var list = this.quadrants.filter(quad => _.isEqual(quad.id, id));

        if (Array.isArray(list) && list.length > 0) {
            return (list[0]);
        }

        return null;
    }

    onQuadrantEditClicked(event, id: string) {
        this.quadrantForm.reset();

        var quadrant = this.findQuadrantById(id);

        if (quadrant != undefined) {
            this.quadrantForm.patchValue({
                id: quadrant.id,
                name: quadrant.name,
                quadrantNumber: quadrant.quadrantNumber,
                description: quadrant.description
            });
        }

        this.quadrantInEditMode = id;
    }

    onQuadrantSaveClicked(event) {
        this.saveQuadrant();

        this.quadrantInEditMode = '';
    }

    onQuadrantCancelClicked(event) {
        this.quadrantForm.reset();
        this.quadrantInEditMode = '';
    }

    saveQuadrant(): void {
        var quadrant: Quadrant;
        if (this.quadrantForm.dirty && this.quadrantForm.valid) {
            let p = Object.assign({}, quadrant, this.quadrantForm.value);

            this.quadrantSaveEvent.emit(p);
        } else if (!this.quadrantForm.dirty) {
            this.onSaveComplete(null);
        }
    }

    onSaveComplete(quadrant: Quadrant): void {
        // Reset the form to clear the flags
        this.quadrantForm.reset();
    }
}

import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, ElementRef, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, FormControlName } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastsManager, Toast } from 'ng2-toastr/ng2-toastr';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { IRadar, Radar, Quadrant, Cycle } from '../../../models';
import { RadarService } from '../../../services';

import { QuadrantEditableListComponent } from '../';
import { GenericValidator } from '../../../shared';

@Component({
    templateUrl: './radar-edit.component.html'
})
export class RadarEditComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

    pageTitle: string = 'Radar Edit';
    errorMessage: string;
    radarForm: FormGroup;

    radar: IRadar;
    private sub: Subscription;

    displayMessage: { [key: string]: string } = {};
    private validationMessages: { [key: string]: { [key: string]: string } } = {
        code: {
            required: 'Radar code is required.',
            minlength: 'Radar code must be at least three characters.',
            maxlength: 'Radar code cannot exceed 20 characters.'
        },
        name: {
            required: 'Radar name is required.',
            minlength: 'Radar name must be at least three characters.'
        }
    };

    genericValidator: GenericValidator;

    constructor(private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private radarService: RadarService,
        private toastr: ToastsManager,
        private vcr: ViewContainerRef
    ) {
        this.toastr.setRootViewContainerRef(vcr);
        this.genericValidator = new GenericValidator(this.validationMessages);
    }

    ngOnInit(): void {
        this.buildForm();

        // Read the radar id from the query parameter
        this.sub = this.route.queryParams.subscribe(
            params => {
                let id = params['id'];
                this.getRadar(id);
            }
        );
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    ngAfterViewInit(): void {
        // Watch for the blur event from any input element on the form.
        let controlBlurs: Observable<any>[] = this.formInputElements
            .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

        // Merge the blur event observable with the valueChanges observable
        Observable.merge(this.radarForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
            this.displayMessage = this.genericValidator.processMessages(this.radarForm);
        });
    }

    private buildForm() {
        this.radarForm = this.fb.group({
            name: ['', [
                Validators.required,
                Validators.minLength(3)
            ]],
            code: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(20)
            ]],
            description: ''
        });

    }

    onDeleteClick() {
        this.deleteRadar();
    }

    onCancelClick() {
        this.resetForm();
    }

    onFormSubmit() {
        this.saveRadar();
    }

    showChildren(): boolean {
        if (this.radar == undefined) return false;

        return true;
    }

    getRadar(id: string): void {
        if (id == undefined || id == null) {
            this.onRadarRetrieved(null);
        } else {
            this.radarService.getRadarById(id).subscribe(
                (radar: IRadar) => this.onRadarRetrieved(radar),
                (error: any) => this.errorMessage = <any>error
            );
        }
    }

    onRadarRetrieved(radar: IRadar): void {
        this.radar = radar;

        this.resetForm();
    }

    private resetForm() {
        if (this.radarForm) {
            this.radarForm.reset();
        }

        if (this.radar == undefined) {
            this.pageTitle = 'Add Radar';

            this.radarForm.patchValue({
                name: "",
                code: "",
                description: ""
            });
        } else {
            this.pageTitle = `Edit Radar: ${this.radar.name}`;

            this.radarForm.patchValue({
                name: this.radar.name,
                code: this.radar.code,
                description: this.radar.description
            });
        }
    }

    deleteRadar(): void {
        if (this.radar == undefined) {
            // Don't delete, it was never saved.
            this.onDeleteComplete();
        } else {
            if (confirm(`Really delete the radar: ${this.radar.name}?`)) {
                this.radarService.deleteRadar(this.radar).subscribe(
                    () => this.onDeleteComplete(),
                    (error: any) => this.errorMessage = <any>error
                    );
            }
        }
    }

    saveRadar(): void {
        if (this.radarForm.dirty && this.radarForm.valid) {
            // Copy the form values over the radar object values
            let p = Object.assign({}, this.radar, this.radarForm.value);

            this.radarService.saveRadar(p).subscribe(
                (data) => this.onSaveComplete(data),
                (error: any) => this.errorMessage = <any>error
            );
        } else if (!this.radarForm.dirty) {
            this.onSaveComplete(null);
        }
    }

    saveQuadrant(quadrant): void {
        this.radarService.saveQuadrantToRadar(this.radar.id, quadrant).subscribe(
            (data) => this.onSaveComplete(data),
            (error: any) => this.errorMessage = <any>error
        );
    }

    onSaveComplete(radar: Radar): void {
        // Reset the form to clear the flags
        this.radarForm.reset();
        var navigate = false;

        if (radar == undefined || radar == null) {
            this.onRadarRetrieved(this.radar);
            this.toastr.error('Save failed');
        } else {
            if (this.radar == undefined) {
                navigate = true;
            }

            this.radar = radar;
            this.onRadarRetrieved(radar);

            this.toastr.success('Saved successful').then((toast: Toast) => {
                if (navigate) {
                    console.log("Navigated to %s", this.radar.id);
                    this.router.navigate(['/edit/radar'], { queryParams: { id: this.radar.id } });
                }
            });
        }
    }

    onDeleteComplete(): void {
        this.toastr.success('Deletion successful').then((toast: Toast) => {
            this.router.navigate(['/edit/radar']);
        });
    }
}

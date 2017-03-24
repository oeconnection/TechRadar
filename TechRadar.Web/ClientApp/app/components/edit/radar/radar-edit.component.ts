import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, FormControlName } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { IRadar, Radar, Quadrant, Cycle } from '../../../models';
import { RadarService } from '../../../services';

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
    private validationMessages: { [key: string]: { [key: string]: string } };
    private alerts: any[] = [];

    constructor(private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private radarService: RadarService) {

        // Defines all of the validation messages for the form.
        // These could instead be retrieved from a file or database.
        this.validationMessages = {
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
    }

    ngOnInit(): void {
        this.buildForm();

        // Read the radar code from the route parameter
        this.sub = this.route.params.subscribe(
            params => {
                let code = params['code'];
                this.getRadar(code);
            }
        );
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    ngAfterViewInit(): void {
        //// Watch for the blur event from any input element on the form.
        //let controlBlurs: Observable<any>[] = this.formInputElements
        //    .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

        //// Merge the blur event observable with the valueChanges observable
        //Observable.merge(this.radarForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
        //////    this.displayMessage = this.genericValidator.processMessages(this.radarForm);
        //});
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

    showChildren(): boolean {
        if (this.radar == undefined) return false;

        return true;
    }

    addAlert(message: string, type = 'info', timeout = 5000, dismissible = false) {
        this.alerts.push({
            type: type,
            message: message,
            timeout: timeout,
            dismissible: dismissible
        });
    }

    getRadar(code: string): void {
        if (code == undefined || code == null) {
            this.onRadarRetrieved(null);
        } else {
            this.radarService.getRadar(code).subscribe(
                (radar: IRadar) => this.onRadarRetrieved(radar),
                (error: any) => this.errorMessage = <any>error
            );
        }
    }

    onRadarRetrieved(radar: IRadar): void {
        if (this.radarForm) {
            this.radarForm.reset();
        }
        this.radar = radar;

        if (this.radar == undefined) {
            this.pageTitle = 'Add Radar';
        } else {
            this.pageTitle = `Edit Radar: ${this.radar.name}`;
        }

        if (this.radar == undefined) {
            // Update the data on the form
            this.radarForm.patchValue({
                name: "",
                code: "",
                description: ""
            });
        } else {
            // Update the data on the form
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

    onSaveComplete(radar: IRadar): void {
        // Reset the form to clear the flags
        this.radarForm.reset();

        var radarCode = '';
        if (radar != undefined) {
            this.radar = radar;
            radarCode = this.radar.code;
            this.router.navigate(['/edit/radar/' + radarCode]);
            this.addAlert('Radar saved', 'success');
        } else {
            this.addAlert('Radar save failed', 'danger');
        }
    }

    onDeleteComplete(): void {
        this.router.navigate(['/home']);
//        this.addAlert('Radar deleted', 'success');
    }
}

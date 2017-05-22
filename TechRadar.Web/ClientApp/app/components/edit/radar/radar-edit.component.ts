import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, ElementRef, ViewContainerRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControlName } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastsManager } from "ng2-toastr/ng2-toastr";

import "rxjs/add/operator/debounceTime";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/merge";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";

import { IRadar, Radar, Blip, Cycle, Quadrant } from "../../../models";
import { RadarService } from "../../../services";

import { GenericValidator } from "../../../shared";
import { DialogService } from "ng2-bootstrap-modal";
import { ConfirmDialogComponent } from "../../modal"

@Component({
    templateUrl: "./radar-edit.component.html",
    styleUrls: ["./radar-edit.component.scss"]
})
export class RadarEditComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

    pageTitle: string = "Radar Edit";
    errorMessage: string;
    radarForm: FormGroup;

    radar: IRadar;
    blips: Blip[];
    private sub: Subscription;
    private dataSubscription: Subscription;
    private radarName: string;
    private radarDescription: string;
    private radarId: string;
    private radarSized: boolean;

    displayMessage: { [key: string]: string } = {};
    private validationMessages: { [key: string]: { [key: string]: string } } = {
        name: {
            required: "Radar name is required.",
            minlength: "Radar name must be at least two characters.",
            maxlength: "Name cannot be more than 50 characters."
        },
        description: {
            maxlength: "Description cannot be more than 500 characters."
        }
    };
    private readonly radarListDataName = "global.radars";

    genericValidator: GenericValidator;

    constructor(private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private radarService: RadarService,
        private toastr: ToastsManager,
        private vcr: ViewContainerRef,
        private dialogService: DialogService
    ) {
        this.toastr.setRootViewContainerRef(vcr);
        this.genericValidator = new GenericValidator(this.validationMessages);
    }

    ngOnInit(): void {
        this.buildForm();

        // Read the radar id from the query parameter
        this.sub = this.route.queryParams.subscribe(
            params => {
                let id = params["id"];
                this.getRadar(id);
            }
        );
    }

    ngOnDestroy(): void {
        if (this.sub !== null && this.sub !== undefined) {
            this.sub.unsubscribe();
        }
        if (this.dataSubscription !== null && this.dataSubscription !== undefined) {
            this.dataSubscription.unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        // Watch for the blur event from any input element on the form.
        let controlBlurs: Observable<any>[] = this.formInputElements
            .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, "blur"));

        // Merge the blur event observable with the valueChanges observable
        Observable.merge(this.radarForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(() => {
            this.displayMessage = this.genericValidator.processMessages(this.radarForm);
        });
    }

    private buildForm() {
        this.radarForm = this.fb.group({
            name: ["", [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(50)
            ]],
            description: ["", [
                Validators.maxLength(500)
            ]],
            sized: [""]
        });

    }

    onDeleteClick() {
        if (this.radar != undefined) {
            this.dialogService.addDialog(ConfirmDialogComponent, {
                title: "Confirmation",
                message: `Really delete the radar: ${this.radar.name}?`
            })
                .subscribe((isConfirmed) => {
                    if (isConfirmed) {
                        this.deleteRadar();
                    }
                });
        }        
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

    isDeleteDisabled(): boolean {
        return (
            this.radar == undefined ||
            this.radar == null ||
            this.radar.id == undefined || 
            this.radar.id == null
        );
    }

    getRadar(id: string): void {
        if (id == undefined || id == null) {
            this.onRadarRetrieved(null);
        } else {
            this.dataSubscription = Observable.forkJoin(
                this.radarService.getRadar(id),
                this.radarService.getRadarBlips(id)
            ).subscribe(
                (data) => {
                    this.onRadarRetrieved((data[0]) as Radar);
                    this.blips = ((data[1]) as Blip[]).sort((a: Blip, b: Blip) => {
                        if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) return -1;
                        if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) return 1;
                        return 0;
                    });
                },
                (error: any) => this.errorMessage = error
            );
        }
    }

    onRadarRetrieved(radar: IRadar): void {
        if (radar != undefined) {
            this.radar = radar;
            this.radarId = radar.id;
            this.radarName = radar.name;
            this.radarDescription = radar.description;
            this.radarSized = radar.sized;
        }

        this.resetForm();
    }

    private resetForm() {
        if (this.radarForm) {
            this.radarForm.reset();
        }

        if (this.radar == undefined) {
            this.pageTitle = "Add Radar";

            this.radarForm.patchValue({
                name: "",
                sized: false,
                description: ""
            });

            this.radarSized = false;
        } else {
            this.pageTitle = `Edit Radar: ${this.radar.name}`;

            this.radarForm.patchValue({
                name: this.radar.name,
                sized: this.radar.sized,
                description: this.radar.description
            });

            this.radarSized = this.radar.sized;
        }

    }

    changeSizing(event, item) {
        let checked = event.toElement.checked;
        this.radarSized = checked;
        console.log(`Item ${checked}`);
    }

    deleteRadar(): void {
        this.radarService.deleteRadar(this.radar).subscribe(
            () => this.onDeleteComplete(),
            (error: any) => this.errorMessage = error
        );
    }

    saveRadar(): void {
        if (this.radarForm.dirty && this.radarForm.valid) {
            // Copy the form values over the radar object values
            let p = Object.assign({}, this.radar, this.radarForm.value);

            this.radarService.saveRadar(p).subscribe(
                (data) => this.onSaveComplete(data),
                (error: any) => this.errorMessage = error
            );
        } else if (!this.radarForm.dirty) {
            this.onSaveComplete(null);
        }
    }

    saveQuadrant(quadrant): void {
        this.radarService.saveQuadrantToRadar(this.radar.id, quadrant).subscribe(
            (data) => this.onSaveComplete(data),
            (error: any) => this.errorMessage = error
        );
    }

    onSaveComplete(radar: Radar): void {
        // Reset the form to clear the flags
        this.radarForm.reset();
        let navigate = false;

        if (radar == undefined || radar == null) {
            this.onRadarRetrieved(this.radar);
            this.toastr.error("Save failed");
        } else {
            if (this.radar == undefined) {
                navigate = true;
            }

            this.radar = radar;
            this.onRadarRetrieved(radar);

            this.toastr.success("Saved successful").then(() => {
                //this.stateManager.notifyDataChanged(this.radarListDataName, null);

                if (navigate) {
                    this.router.navigate(["/edit/radar"], { queryParams: { id: this.radar.id } });
                } else {
                    this.resetCycleArray();
                    this.resetQuadrantArray();
                }
            });
        }
    }

    onDeleteComplete(): void {
        this.toastr.success("Deletion successful").then(() => {
            //this.stateManager.notifyDataChanged(this.radarListDataName, null);
            this.router.navigate(["/"]);
        });
    }

    saveCycle(cycle: Cycle): void {
        this.radarService.saveCycleToRadar(this.radar.id, cycle).subscribe(
            (data) => this.onSaveComplete(data),
            (error: any) => this.errorMessage = error
        );
    }

    deleteCycle(cycle: Cycle): void {
        this.radarService.deleteCycleFromRadar(this.radar.id, cycle.id).subscribe(
            (data) => this.onSubDeleteComplete(data),
            (error: any) => this.errorMessage = error
        );
    }

    private resetCycleArray(): void {
        const cycles = new Array<Cycle>();
        this.radar.cycles.forEach((item) => {
            cycles.push(item);
        });

        this.radar.cycles = cycles;
    }

    private resetQuadrantArray(): void {
        const quadrants = new Array<Quadrant>();
        this.radar.quadrants.forEach((item) => {
            quadrants.push(item);
        });

        this.radar.quadrants = quadrants;
    }

    onSubDeleteComplete(radar: Radar): void {
        // Reset the form to clear the flags
        this.radarForm.reset();
        let navigate = false;

        if (radar == undefined || radar == null) {
            this.onRadarRetrieved(this.radar);
            this.toastr.error("Delete failed");
        } else {
            if (this.radar == undefined) {
                navigate = true;
            }

            this.radar = radar;
            this.onRadarRetrieved(radar);

            this.toastr.success("Delete successful").then(() => {
                if (navigate) {
                    this.router.navigate(["/edit/radar"], { queryParams: { id: this.radar.id } });
                } else {
                    this.resetCycleArray();
                    this.resetQuadrantArray();
                }
            });
        }
    }

    saveBlip(blip: Blip, callback): void {
        this.radarService.saveBlipToRadar(this.radar.id, blip).subscribe(
            (data) => this.onSaveBlipComplete(data),
            (error: any) => this.errorMessage = error
        );
    }

    deleteBlip(blip): void {
        this.radarService.deleteBlipFromRadar(this.radar.id, blip.id).subscribe(
            (data) => this.onBlipDeleteComplete(data),
            (error: any) => this.errorMessage = error
        );
    }

    private inPlaceUpdateOfBlip(blip: Blip): void {
        const newBlips = new Array<Blip>();
        this.blips.forEach((item) => {
            if (item.id == undefined || item.id === "" || item.id === "newid" || blip.id === item.id) {
                newBlips.push(blip);
            } else {
                newBlips.push(item);
            }
        });

        this.blips = newBlips;
    }

    onSaveBlipComplete(blip: Blip): void {
        if (blip == undefined || blip == null) {
            this.onRadarRetrieved(this.radar);
            this.toastr.error("Save failed");
        } else {
            this.inPlaceUpdateOfBlip(blip);

            this.toastr.success("Saved successful");

            this.onRadarRetrieved(this.radar);
        }
    }

    onBlipDeleteComplete(blip: Blip): void {
        if (blip == undefined || blip == null) {
            this.onRadarRetrieved(this.radar);
            this.toastr.error("Save failed");
        } else {
            let newBlips = new Array<Blip>();
            this.blips.forEach((item) => {
                if (blip.id !== item.id) {
                    newBlips.push(item);
                }
            });
            this.blips = newBlips;
            this.toastr.success("Delete successful");

            this.onRadarRetrieved(this.radar);
        }
    }


}

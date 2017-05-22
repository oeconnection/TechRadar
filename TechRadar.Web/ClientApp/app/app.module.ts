import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { HttpModule, JsonpModule } from "@angular/http";
import { RouterModule } from "@angular/router";
import { BrowserModule } from "@angular/platform-browser"
import { AppComponent } from "./components/app/app.component"
import { NavMenuComponent } from "./components/navmenu/navmenu.component";
import { HomeComponent } from "./components/home/home.component";
import { RadarDisplayComponent, ChartComponent, QuadrantListComponent, CycleComponent, BlipComponent } from "./components/radar-parts"
import { RadarService, ThemePreloaderService, ThemeSpinnerService } from "./services"
import { D3Service } from "d3-ng2-service";
import { TooltipModule, PaginationModule, PopoverModule } from "ng2-bootstrap";
import { RadarEditComponent, QuadrantEditableListComponent, CycleEditableListComponent, BlipEditableListComponent } from "./components/edit";
import { RadarComponent } from "./components/radar";
import { FormsModule , ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastModule } from "ng2-toastr/ng2-toastr";
import { BootstrapModalModule } from "ng2-bootstrap-modal";
import { ConfirmDialogComponent, FormErrorDialogComponent } from "./components/modal";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { NumericEditorComponent } from "./components/grid-editors"
import { StoreModule } from "@ngrx/store";
import { hoverStoreReducer } from "./services/state-management/reducers/hover-state-reducer";


@NgModule({
    bootstrap: [ AppComponent ],
    declarations: [
        AppComponent,
        NavMenuComponent,
        RadarDisplayComponent,
        ChartComponent,
        CycleComponent,
        QuadrantListComponent,
        CycleEditableListComponent,
        RadarEditComponent,
        QuadrantEditableListComponent,
        BlipEditableListComponent,
        RadarComponent,
        BlipComponent,
        HomeComponent,
        ConfirmDialogComponent,
        FormErrorDialogComponent,
        NumericEditorComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpModule,
        JsonpModule,
        FormsModule,
        ReactiveFormsModule, 
        BootstrapModalModule,
        RouterModule.forRoot([
            { path: "", redirectTo: "home", pathMatch: "full" },
            { path: "home", component: HomeComponent },
            { path: "radar/:id", component: RadarComponent },
            { path: "edit/radar", component: RadarEditComponent },
            { path: "**", redirectTo: "home" }
        ]),
        ToastModule.forRoot(),
        TooltipModule.forRoot(),
        PaginationModule.forRoot(),
        PopoverModule.forRoot(),
        Ng2SmartTableModule,
        StoreModule.provideStore({ hoverStoreReducer })
    ],
    providers: [D3Service, RadarService, ThemeSpinnerService, ThemePreloaderService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    entryComponents: [
        ConfirmDialogComponent,
        FormErrorDialogComponent,
        NumericEditorComponent
    ]
})
export class AppModule {
}

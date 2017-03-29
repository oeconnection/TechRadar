import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpModule, JsonpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser'
import { AppComponent } from './components/app/app.component'
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
import { RadarDisplayComponent, ChartComponent, QuadrantListComponent, CycleComponent, BlipComponent } from './components/radar-parts'
import { RadarService, RadarResolve } from './services'
import { D3Service } from 'd3-ng2-service';
import { TooltipModule, PaginationModule, AlertModule } from 'ng2-bootstrap';
import { RadarEditComponent, QuadrantEditableListComponent } from './components/edit';
import { RadarComponent } from './components/radar';
import { ReactiveFormsModule } from "@angular/forms";
import { platformServer } from '@angular/platform-server';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

@NgModule({
    bootstrap: [ AppComponent ],
    declarations: [
        AppComponent,
        NavMenuComponent,
        RadarDisplayComponent,
        ChartComponent,
        CycleComponent,
        QuadrantListComponent,
        RadarEditComponent,
        QuadrantEditableListComponent,
        RadarComponent,
        BlipComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpModule,
        JsonpModule,
        ReactiveFormsModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'radar/:code', component: RadarComponent },
            { path: 'edit/radar', component: RadarEditComponent },
            { path: '**', redirectTo: 'home' }
        ]),
        ToastModule.forRoot(),
        TooltipModule.forRoot(),
        PaginationModule.forRoot()
    ],
    providers: [D3Service, RadarService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule {
}

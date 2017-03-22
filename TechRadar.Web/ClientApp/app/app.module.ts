import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UniversalModule } from 'angular2-universal';
import { AppComponent } from './components/app/app.component'
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
import { RadarDisplayComponent, ChartComponent, QuadrantListComponent, CycleComponent, BlipComponent } from './components/radar-parts'
import { RadarService, RadarResolve } from './services'
import { D3Service } from 'd3-ng2-service';
import { TooltipModule } from 'ng2-bootstrap';
import { PaginationModule } from 'ng2-bootstrap';
import { RadarListComponent } from './components/edit';
import { RadarComponent } from './components/radar';
import { Ng2TableModule } from 'ng2-table/ng2-table'

@NgModule({
    bootstrap: [ AppComponent ],
    declarations: [
        AppComponent,
        NavMenuComponent,
        RadarDisplayComponent,
        ChartComponent,
        CycleComponent,
        QuadrantListComponent,
        RadarListComponent,
        RadarComponent,
        BlipComponent,
        HomeComponent
    ],
    imports: [
        UniversalModule, // Must be first import. This automatically imports BrowserModule, HttpModule, and JsonpModule too.
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'radar/:name', component: RadarComponent },
//            { path: 'radar/:name/:quadrantNumber', component: RadarDisplayComponent },
            {
                path: 'edit/radar', component: RadarListComponent
            },
            { path: '**', redirectTo: 'home' }
        ]),
        TooltipModule.forRoot(),
        PaginationModule.forRoot(),
        Ng2TableModule
    ],
    providers: [D3Service, RadarService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule {
}

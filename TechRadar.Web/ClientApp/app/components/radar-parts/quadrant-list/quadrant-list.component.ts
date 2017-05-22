import {
    Component,
    OnChanges,
    Input,
    ViewEncapsulation
} from "@angular/core";
import { Radar, Quadrant, Cycle, Blip } from "../../../models";
import { IHoverState, ON_HOVER, OFF_HOVER } from "../../../services/state-management";
import { Store } from "@ngrx/store";

@Component({
    selector: "quadrant-list",
    templateUrl: "./quadrant-list.component.html",
    styleUrls: ["./quadrant-list.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class QuadrantListComponent implements OnChanges {
    @Input() radar: Radar;
    @Input() quadrant: number;

    private quadrantData: Quadrant;
    private blips: Blip[];
    private cycles: Cycle[];
    private radarId: string;
    private sizedRadar: boolean;
    private panelClass: string;
    private activeBlip: Blip;
    private readonly activatedBlipEventName = "activated.blip";

    constructor(private store: Store<IHoverState>) {

        this.panelClass = "";
        this.activeBlip = null;
        this.sizedRadar = false;

        store.select("hoverStoreReducer")
            .subscribe((data: IHoverState) => {
                this.activeBlip = data.activeBlip;
            });
    }

    ngOnChanges() {
        this.setup();
    }

    private setup(): void {
        if (this.radar) {
            this.quadrantData = this.radar.findQuadrantByNumber(this.quadrant);
            this.blips = this.radar.findBlipsByQuadrantId(this.quadrantData.id);
            this.cycles = this.radar.cycles;
            this.radarId = this.radar.id;
            this.sizedRadar = this.radar.sized;
            this.panelClass = `panel-${this.getBlipClassNameByQuadrant(this.quadrantData)}`;
        }
    }

    private getBlipClassNameByQuadrant(quadrant: Quadrant) {
        if (quadrant != null) {
            switch (quadrant.quadrantNumber) {
                case 1:
                    return "first";

                case 2:
                    return "second";

                case 3:
                    return "third";

                case 4:
                    return "fourth";
            }
        }

        return "";
    }

    private getQuadrantPopoverPlacement(quadrant: Quadrant) {
        if (quadrant != null) {
            switch (quadrant.quadrantNumber) {
                case 1:
                    return "right";

                case 2:
                    return "left";

                case 3:
                    return "left";

                case 4:
                    return "right";
            }
        }

        return "";
    }

    public onMouseOverBlip(blip: Blip): void {
        this.activeBlip = blip;
//        this.stateManager.notifyDataChanged(this.activatedBlipEventName, blip);
        this.store.dispatch({ type: ON_HOVER, payload: { activeBlip: blip } });
    }

    public onMouseOutBlip(): void {
        this.activeBlip = null;
//        this.stateManager.notifyDataChanged(this.activatedBlipEventName, null);
        this.store.dispatch({ type: OFF_HOVER });
    }

    public isActiveBlip(blip: number): boolean {
        if (this.activeBlip == null) {
            return false;
        }
        return this.activeBlip.blipNumber === blip;
    }

    private getBlipsByCycleId(id: string): Blip[] {
        return this.blips.filter(x => x.cycleId === id);
    }
}

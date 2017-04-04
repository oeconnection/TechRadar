// These 2 items will make sure that you can annotate
// a modalcomponent with @Modal()
export class ModalContainer {
    destroy: Function;
    componentIndex: number;
    closeModal(): void {
        this.destroy();
    }
}
export function Modal() {
    return function (target) {
        Object.assign(target.prototype, ModalContainer.prototype);
    };
}

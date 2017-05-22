import { Injectable } from "@angular/core";

@Injectable()
export class ThemePreloaderService {

    private static loaders: Array<Promise<any>> = [];

    static registerLoader(method: Promise<any>): void {
        ThemePreloaderService.loaders.push(method);
    }

    static clear(): void {
        ThemePreloaderService.loaders = [];
    }

    static load(): Promise<any> {
        return new Promise((resolve) => {
            ThemePreloaderService.executeAll(resolve);
        });
    }

    private static executeAll(done: Function): void {
        setTimeout(() => {
            Promise.all(ThemePreloaderService.loaders).then((values) => {
                done.call(null, values);

            }).catch((error) => {
                console.error(error);
            });
        });
    }
}

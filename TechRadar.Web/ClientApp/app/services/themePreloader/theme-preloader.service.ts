import { Injectable } from '@angular/core';

@Injectable()
export class ThemePreloaderService {

    private static _loaders: Array<Promise<any>> = [];

    public static registerLoader(method: Promise<any>): void {
        ThemePreloaderService._loaders.push(method);
    }

    public static clear(): void {
        ThemePreloaderService._loaders = [];
    }

    public static load(): Promise<any> {
        return new Promise((resolve, reject) => {
            ThemePreloaderService._executeAll(resolve);
        });
    }

    private static _executeAll(done: Function): void {
        setTimeout(() => {
            Promise.all(ThemePreloaderService._loaders).then((values) => {
                done.call(null, values);

            }).catch((error) => {
                console.error(error);
            });
        });
    }
}

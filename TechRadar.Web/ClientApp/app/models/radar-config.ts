import { Radar, Blip } from './';

export interface RadarConfig {
    settings: { quadrant: number, size: number, name: string };
    dataset: {
        radar: Radar,
        blips: Blip[]
    };
}

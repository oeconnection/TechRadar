import { Radar } from './';

export interface RadarConfig {
    settings: { quadrant: number, size: number, name: string };
    dataset: Radar;
}

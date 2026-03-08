import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface backendInterface {
    addFeaturedId(imdbId: string): Promise<void>;
    getContactInfo(): Promise<string>;
    getFeaturedIds(): Promise<Array<string>>;
    getQualityLabel(imdbId: string): Promise<string | null>;
    removeFeaturedId(imdbId: string): Promise<void>;
    setContactInfo(info: string): Promise<void>;
    setQualityLabel(imdbId: string, labelText: string): Promise<void>;
}

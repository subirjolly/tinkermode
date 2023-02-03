export type Timestamp = string

export interface Storage {
    lastTimestamp: Timestamp | null,
    average: number | null,
    occurence: number
}
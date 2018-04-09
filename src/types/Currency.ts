export enum UpdateType {
    ADDED = 'Added',
    REMOVED = 'Removed'
}

export interface CurrencyPair {
    Symbol: string
    RatePrecision: number
    PipsPosition: number
    Base: string
    Terms: string
}

export interface CurrencyPairUpdate {
    UpdateType: UpdateType
    CurrencyPair: CurrencyPair
}

export interface CurrencyPairUpdateDTO {
    IsStateOfTheWorld: boolean
    IsStale: boolean
    Updates: CurrencyPairUpdate[]
}

export interface PriceUpdate {
    Symbol: string
    Mid: number
    Ask: number
    Bid: number
    CreationTimestamp: string
    ValueDate: string
}
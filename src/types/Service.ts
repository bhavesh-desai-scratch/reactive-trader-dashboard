export interface ServiceStatusUpdate {
    Load: 0,
    Instance: string,
    Type: string,
    Timestamp: string
}

export enum TOPIC {
    STATUS = 'status'
}

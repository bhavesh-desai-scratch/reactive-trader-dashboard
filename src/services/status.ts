import { ServiceStatusUpdate } from '../types/Service'
import { scan } from 'rxjs/operators'
import { Observable } from 'rxjs/index'

export function serviceHealth$(statusTopic$: Observable<ServiceStatusUpdate>) {
    return statusTopic$.pipe(
        scan<ServiceStatusUpdate, Map<string, ServiceStatusUpdate>>(
            (acc, next) => {
                acc.set(next.Instance, next)
                return acc;
            },
            new Map())
    )
}
import { filter, map, mergeAll, share, take } from 'rxjs/operators'
import { combineLatest, Observable } from 'rxjs/index'
import { CurrencyPair, CurrencyPairUpdateDTO, UpdateType } from '../types/Currency'
import { Session } from 'autobahn'
import { requestTopicStream } from './AutoBahnConnection'
import { createTopic } from '../components/util'
import { ServiceStatusUpdate } from '../types/Service'

export function referenceDataService$(connectionOpen$: Observable<Session>,
                                      statusTopic$: Observable<ServiceStatusUpdate>) {

    const refDataServiceInstance$ = statusTopic$.pipe(
        filter(serviceUpdate => serviceUpdate.Type === 'reference'),
        take(1)
    )

    const refData$ = combineLatest(
        connectionOpen$,
        refDataServiceInstance$,
        (session: Session, instance) => {
            const procedure = `${instance.Instance}.getCurrencyPairUpdatesStream`;
            return requestTopicStream<CurrencyPairUpdateDTO, {}>(
                {
                    session,
                    replyTo: createTopic(instance.Type),
                    procedure,
                    payload: {}
                })
        }).pipe(
        mergeAll(),
        share()
    )

    return refData$.pipe(
        map(dto => dto.Updates.reduce<Map<string, CurrencyPair>>(
            (acc, update) => {
                switch (update.UpdateType) {
                    case UpdateType.ADDED:
                        acc.set(update.CurrencyPair.Symbol, update.CurrencyPair)
                        break
                    case UpdateType.REMOVED:
                        acc.delete(update.CurrencyPair.Symbol)
                        break
                    default:
                        console.log('Unknown type')
                }
                return acc
            },
            new Map<string, CurrencyPair>())
        ),
        take(1)
    )
}
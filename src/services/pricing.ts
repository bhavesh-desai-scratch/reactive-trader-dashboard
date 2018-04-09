import { filter, mergeAll, scan, take } from 'rxjs/operators'
import { combineLatest, from, Observable } from 'rxjs/index'
import { CurrencyPair, PriceUpdate } from '../types/Currency'
import { createTopic } from '../components/util'
import { Session } from 'autobahn'
import { ServiceStatusUpdate } from '../types/Service'
import { requestTopicStream } from './AutoBahnConnection'

export function pricingService$(connectionOpen$: Observable<Session>,
                                statusTopic$: Observable<ServiceStatusUpdate>,
                                refData$: Observable<Map<string, CurrencyPair>>) {

    const pricingServiceInstance$ = statusTopic$.pipe(
        filter(serviceUpdate => serviceUpdate.Type === 'pricing'),
        take(1)
    )

    const createPriceSubscription = (session: Session,
                                     service: string,
                                     procedure: string,
                                     payload: PriceSubscriptionParams) => {

        const replyTo = createTopic(service)

        return requestTopicStream<PriceUpdate, PriceSubscriptionParams>({
            procedure,
            replyTo,
            session,
            payload
        })
    }

    const pricing$ = combineLatest(
        connectionOpen$,
        pricingServiceInstance$,
        refData$,
        (session, instance, refData) => {
            const keys = Array.from(refData.keys());
            return from(keys.map(symbol => createPriceSubscription(
                session,
                instance.Type,
                `${instance.Instance}.getPriceUpdates`,
                {symbol})
            )).pipe(
                mergeAll())
        }).pipe(
        mergeAll()
    )

    interface PriceSubscriptionParams {
        symbol: string
    }

    return pricing$.pipe(
        scan<PriceUpdate, Map<string, PriceUpdate>>(
            (acc, next) => {
                acc.set(next.Symbol, next)
                return acc
            },
            new Map())
    )

}
import * as React from 'react';
import {
    ConnectionEvent, ConnectionEventType, createConnection,
    createTopicSession
} from './services/AutoBahnConnection';
import { filter, map, mergeMap, share } from 'rxjs/operators';
import { Session } from 'autobahn'
import { componentFromStream } from 'recompose'
import { ServiceStatusUpdate, TOPIC } from './types/Service'
import { ServiceStatus } from './components/ServiceStatus'
import { Heading } from './style-guide'
import { ReferenceData } from './components/ReferenceData'
import { PriceData } from './components/PriceData'
import { referenceDataService$ } from './services/referenceData'
import { pricingService$ } from './services/pricing'
import { serviceHealth$ } from './services/status'

const autoBahnConnection$ = createConnection({
    realm: 'com.weareadaptive.reactivetrader',
    url: 'web-demo.adaptivecluster.com'
})

const connect = autoBahnConnection$.connect()

const connectionOpen$ = autoBahnConnection$.pipe(
    filter<ConnectionEvent>(connEvent => connEvent.type === ConnectionEventType.OPEN),
    map<ConnectionEvent, Session>(connEvent => connEvent.data as Session)
)

const statusTopic$ = connectionOpen$.pipe(
    mergeMap(session => createTopicSession<ServiceStatusUpdate, {}>(session, TOPIC.STATUS)),
    share()
)

const serviceHealthService$ = serviceHealth$(statusTopic$)

const refData$ = referenceDataService$(connectionOpen$, statusTopic$)

const accPricing$ = pricingService$(connectionOpen$, statusTopic$, refData$)

const ConnectedStatusStream = componentFromStream(
    () => autoBahnConnection$.pipe(
        map(conn => conn.type === ConnectionEventType.OPEN ? 'Connected' : 'Disconnected'),
        map(status => (<Heading>Connection Status: {status}</Heading>))
    ))

const ServiceStatusStream = componentFromStream(
    () =>
        serviceHealthService$.pipe(
            map(status => (<ServiceStatus status={Array.from(status.values())}/>))
        ))

const RefDataStream = componentFromStream(
    () => refData$.pipe(
        map(refData => (<ReferenceData refData={Array.from(refData.values())}/>))
    ))

const PriceDataComponentStream = componentFromStream(
    () => accPricing$.pipe(
        map(priceData => (<PriceData priceData={Array.from(priceData.values())}/>))
    ))

export default class App extends React.Component {
    render() {
        return (
            <div>
                <ConnectedStatusStream/>
                <ServiceStatusStream/>
                <RefDataStream/>
                <PriceDataComponentStream/>
            </div>
        )
    }
}

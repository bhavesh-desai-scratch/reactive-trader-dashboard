import { Connection, ISubscription, Session } from 'autobahn'
import { Observable, Subscribable } from 'rxjs';
import { BehaviorSubject, ConnectableObservable, ReplaySubject } from 'rxjs/index'
import { publishReplay } from 'rxjs/operators'

interface ConnectionParams {
    url: string,
    realm: string,
    port?: number,
}

interface CloseEvent {
    reason: string;
    details: string;
}

export enum ConnectionEventType {
    OPEN,
    CLOSE
}

export type ConnectionEvent =
    | {
    type: ConnectionEventType.OPEN,
    data: Session
}
    | {
    type: ConnectionEventType.CLOSE,
    data: | CloseEvent
}

export function createConnection({url, port = 80, realm}: ConnectionParams) {

    const useSecure = location.protocol === 'https:';
    const securePort = 443;

    const connection = new Connection({
        realm,
        use_es6_promises: true,
        max_retries: -1, // unlimited retries,
        transports: [
            {
                type: 'websocket',
                url: useSecure ? `wss://${url}:${securePort}/ws` : `ws://${url}:${port}/ws`,
            }
        ],
    });

    return new Observable<ConnectionEvent>(subscriber => {

        connection.onopen = session => {
            subscriber.next({type: ConnectionEventType.OPEN, data: session});
        };

        connection.onclose = (reason, details) => {
            subscriber.next({type: ConnectionEventType.CLOSE, data: {reason, details}});
            return true;
        };

        connection.open()

        return () => {
            console.log('close')
            connection.close('Application timeout')
        }
    }).pipe(
        publishReplay(1)
    ) as ConnectableObservable<ConnectionEvent>;
}

interface AutoBahnPayload<T> {
    payload: T,
    replyTo: string,
}

export interface AutoBahnArgs<T> {
    procedure: string,
    request: AutoBahnPayload<T>[],
}

export interface RequestStreamParams<T> {
    session: Session
    replyTo: string
    procedure: string
    payload: T
}

export function requestTopicStream<T, R>({session, replyTo, procedure, payload}: RequestStreamParams<R>) {

    const dto: AutoBahnArgs<R> = {
        request: [{
            payload: payload,
            replyTo,
        }],
        procedure
    }

    const input = new BehaviorSubject<AutoBahnArgs<R>>(dto)
    input.next(dto);

    return createTopicSession<T, {}>(session, replyTo, input)
}

export function createTopicSession<T, R>(session: Session, topic: string, input?: Subscribable<AutoBahnArgs<R>>) {

    return new Observable<T>(subscriber => {

            let subscription: ISubscription;
            session.subscribe(topic, (response: T[]) => subscriber.next(response[0]))
                .then(
                    s => {
                        if (input) {
                            input.subscribe(request => {
                                session.call(request.procedure, request.request).then(
                                    x => console.log(x),
                                    x => console.log(x)
                                )
                            })
                        }
                        subscription = s
                    },
                    e => {
                        subscriber.error(e)
                    })
            return () => {
                if (subscription) {
                    session.unsubscribe(subscription)
                }
            }
        }
    );
}
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { setObservableConfig } from 'recompose'
import { Observable, Observer } from 'rxjs/index'

setObservableConfig({
    fromESObservable: (sub) => {
        return Observable.create((obs: Observer<{}>) => {
            sub.subscribe(obs)
        })
    },
})

ReactDOM.render(
    <App/>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();

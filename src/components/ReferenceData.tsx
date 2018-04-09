import * as React from 'react';
import { SFC } from 'react';
import { CurrencyPair } from '../types/Currency'
import { Table } from '../style-guide'

export const ReferenceData: SFC<{ refData: CurrencyPair[] }> = ({refData}) => (
    <Table>
        <thead>
        <tr>
            <td>Symbol</td>
            <td>PipsPosition</td>
            <td>RatePrecision</td>
        </tr>
        </thead>
        <tbody>
        {refData.map(x => (
            <tr key={x.Symbol}>
                <th>{x.Symbol}</th>
                <th>{x.PipsPosition}</th>
                <th>{x.RatePrecision}</th>
            </tr>))}
        </tbody>
    </Table>
)
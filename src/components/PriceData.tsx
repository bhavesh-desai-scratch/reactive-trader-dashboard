import * as React from 'react';
import { SFC } from 'react';
import { PriceUpdate } from '../types/Currency'
import { Table } from '../style-guide'

export const PriceData: SFC<{ priceData: PriceUpdate[] }> = ({priceData}) => (
    <Table>
        <thead>
        <tr>
            <td>Symbol</td>
            <td>Bid</td>
            <td>Ask</td>
            <td>Mid</td>
            <td>CreationTimeStamp</td>
        </tr>
        </thead>
        <tbody>
        {priceData.map(price => (
            <tr key={price.Symbol}>
                <th>{price.Symbol}</th>
                <th>{price.Bid}</th>
                <th>{price.Ask}</th>
                <th>{price.Mid}</th>
                <th>{price.CreationTimestamp}</th>
            </tr>))}
        </tbody>
    </Table>
)
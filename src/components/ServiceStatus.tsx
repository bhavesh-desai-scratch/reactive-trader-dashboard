import { ServiceStatusUpdate } from '../types/Service'
import { SFC } from 'react'
import * as React from 'react';
import { Table } from '../style-guide'
import * as moment from 'moment'

interface StatusProps {
    status: ServiceStatusUpdate[]
}

export const ServiceStatus: SFC<StatusProps> = ({status}) => (
    <Table>
        <thead>
        <tr>
            <td>Type</td>
            <td>Instance</td>
            <td>Load</td>
            <td>Timestamp</td>
        </tr>
        </thead>
        <tbody>
        {status.map(x => (
            <tr key={x.Instance}>
                <th>{x.Type}</th>
                <th>{x.Instance}</th>
                <th>{x.Load}</th>
                <th>{moment(x.Timestamp).format('h:mm:ss a')}</th>
            </tr>))}
        </tbody>
    </Table>)

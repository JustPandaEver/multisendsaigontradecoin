import React from 'react';
import './index.css'
import {Link} from 'react-router-dom'

export default () => (
    <footer id="contact" className="flex-container footer">
        <div><div>© MultiSend</div></div>
        <div><Link to="/donate">Donate</Link></div>
        <ul>
            <li><a target="_blank" rel="noopener noreferrer" href="https://t.me/multisendsgtradecoin">Telegram</a></li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://etherscan.io/address/0x1C874419e06c97dfDE802cd665348e9f97801c5b">Etherscan</a></li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/Multisend-ETH/client-v1">Github</a></li>
        </ul>
    </footer>
)
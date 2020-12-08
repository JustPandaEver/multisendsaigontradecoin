import React from 'react';
import './index.css'
import {Link} from 'react-router-dom'

export default () => (
    <footer id="contact" className="flex-container footer">
        <div><div>© MultiSend</div></div>
        <div><Link to="/donate">Donate</Link></div>
        <ul>
            <li><a target="_blank" rel="noopener noreferrer" href="https://t.me/multisendsgtradecoin">Telegram</a></li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://etherscan.io/address/0xFe99D64fB9B2051689C112e5bEF06EdfcD5d311d">Etherscan</a></li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/yoolsylva/multisendsaigontradecoin">Github</a></li>
        </ul>
    </footer>
)
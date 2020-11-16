import React from "react";
import { withContext } from "./../../provider/index";
import Button from "../ButtonWithRouter";
import imgs from './../../assets/imgs/index';

export default withContext(({ Ref, ctx }) => (
  <div ref={Ref} className="board shadowize gs-modal success-txn">
    <div className="center">
      <div>Waiting for transaction...</div>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://rinkeby.etherscan.io/tx/${ctx.txHash}`}
      >
        View on etherscan
      </a>
      <img src={imgs.loading}/>
    </div>
  </div>
));

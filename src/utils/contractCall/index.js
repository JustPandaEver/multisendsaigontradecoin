import Web3 from 'web3';
import bulksendContractDetails from './contractDetails';

const expectedBlockTime = 1000;

const myGasPrice = 5 * 10 ** 10;

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}


let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
} else {
  console.log('Legacy browser');
  web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');
  if (!web3.currentProvider.isMetaMask) {
    //pass
  }
}

const { TOKEN_ABI, ABI, contractAddress } = bulksendContractDetails;
const bulksendContract = new web3.eth.Contract(ABI, contractAddress);

const enableMetamask = async () => {
  if (window.ethereum) {
    return window.ethereum
      .enable()
      .then(async () => {
        const acct = await getcurrAcct();
        return acct;
      })
      .catch(() => console.log("user denied this")
      );
  }
  else {
    return null
  }

};

const checkMetamask = async () => {
  if (!window.ethereum) {
    return false;
  }

};

const getNetwork = async () => {
  return web3.eth.net.getNetworkType()
};

const getcurrAcct = () => {
  return web3.eth.getAccounts().then(acc => acc[0]);
};

const getContractBal = async () => {
  const currAccount = await getcurrAcct();
  console.log(currAccount);
  bulksendContract.methods
    .owner()
    .call()
    .then(owner => {
      console.log(owner);
    });
  bulksendContract.methods
    .getbalance(contractAddress)
    .call({ from: currAccount })
    .then(bal => console.log(bal));
};

const BN = web3.utils.BN;
const bulksend = async (
  addressArr,
  _amountArr,
  _value = 0,
  onTxHash = console.log,
  onSuccess = console.log,
  onError = console.log
) => {
  const currAccount = await getcurrAcct();
  let amountArr = [];
  for (const a of _amountArr) {
    amountArr.push(web3.utils.toWei(a.toString(), 'ether'));
  }
  let value = new BN(_value)
  for (const amnt of amountArr) {
    value = value.add(new BN(amnt))
  }
  const fee = await bulksendContract.methods.ethSendFee().call();
  console.log("fee", fee)
  value = (value.add(new BN(Number(fee)))).toString();

  // concat 0s to amount array if the length is less than 0 to prevent undefined error
  // amountArr = amountArr.concat(Array(100 - amountArr.length).fill('0'));
  // addressArr = addressArr.concat(
  //   Array(100 - addressArr.length).fill(
  //     '0x0000000000000000000000000000000000000000'
  //   )
  // );
  console.log(amountArr, addressArr);
  try {
    bulksendContract.methods
      .bulkSendEth(addressArr, amountArr)
      .send({
        from: currAccount,
        value: value
      })
      .on('transactionHash', async txHash => {
        console.log(txHash);
        onTxHash(txHash);

        let txReceipt = null
        while (txReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
          txReceipt = await web3.eth.getTransactionReceipt(txHash);
          await sleep(expectedBlockTime)
        }

        onSuccess()
      })
      .on('error', onError);
    return;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const ten = new BN(10)
const bulkSendToken = async (
  tokenAddress,
  addressArr,
  _amountArr,
  _value = 0,
  onTxHash = console.log,
  onReceipt = console.log,
  onSuccess = console.log,
  onError = console.log
) => {
  const currAccount = await getcurrAcct();
  let amountArr = [];
  let total = new BN(0);
  const tokenSendFee = await bulksendContract.methods.tokenSendFee().call();
  const token = new web3.eth.Contract(TOKEN_ABI, tokenAddress);
  const _tokenDecimals = await token.methods.decimals().call();
  const tokenDecimals = new BN(Number(_tokenDecimals))
  for (const a of _amountArr) {
    const bigA = ten.pow(tokenDecimals).muln(Number(a));
    console.log(bigA.toString());
    amountArr.push(bigA.toString());
    total = total.add(bigA)
  }
  let value = new BN(_value)
  value = (value.add(new BN(Number(tokenSendFee)))).toString()
  const _total = total.toString()

  try {
    const _allowance = await token.methods.allowance(currAccount, contractAddress).call({ from: currAccount })
    const allowance = new BN(_allowance.toString())
    console.log(allowance.gte(total), 't', _total, 'v', _allowance.toString())
    if (allowance.gte(total)) {
      // amountArr = amountArr.concat(Array(100 - amountArr.length).fill('0'));
      // addressArr = addressArr.concat(
      //   Array(100 - addressArr.length).fill(
      //     '0x0000000000000000000000000000000000000000'
      //   )
      // );
      console.log(addressArr, amountArr)
      bulksendContract.methods
        .bulkSendToken(tokenAddress, addressArr, amountArr)
        .send({
          from: currAccount,
          value: value,
          gasPrice: myGasPrice
        })
        .on('transactionHash', async txHash => {
          onTxHash(txHash);

          let txReceipt = null
          while (txReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
            txReceipt = await web3.eth.getTransactionReceipt(txHash);
            await sleep(expectedBlockTime)
          }

          onReceipt(txReceipt)

          onSuccess()
        })
        .on('error', onError);
    } else {
      token.methods
        .approve(contractAddress, _total)
        .send({
          from: currAccount,
          gasPrice: myGasPrice
        })
        .on('transactionHash', async txHash => {
          onTxHash(txHash);

          let txReceipt = null
          while (txReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
            txReceipt = await web3.eth.getTransactionReceipt(txHash);
            await sleep(expectedBlockTime)
          }

          onReceipt(txReceipt)

          bulksendContract.methods
            .bulkSendToken(tokenAddress, addressArr, amountArr)
            .send({
              from: currAccount,
              value: value,
              gasPrice: myGasPrice
            })
            .on('transactionHash', async txHash => {
              onTxHash(txHash);

              let txReceipt = null
              while (txReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
                txReceipt = await web3.eth.getTransactionReceipt(txHash);
                await sleep(expectedBlockTime)
              }

              onReceipt(txReceipt)

              onSuccess()
            })
            .on('error', onError);
          return txHash;
        })
        .on('error', onError);
    }

  } catch (err) {
    onError(err)
    return null;
  }
};

const getTokenSymbol = async tokenAddress => {
  try {
    const currAccount = await getcurrAcct();
    const token = new web3.eth.Contract(TOKEN_ABI, tokenAddress);
    const tokenSymbol = await token.methods
      .symbol()
      .call({ from: currAccount });
    return tokenSymbol;
  } catch (err) {
    console.log(err);
    return '';
  }
};

const ethApi = {
  bulksend,
  getContractBal,
  bulkSendToken,
  getTokenSymbol,
  enableMetamask,
  getcurrAcct,
  checkMetamask,
  getNetwork
};

export default ethApi;

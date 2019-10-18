const { LocalProvider } = require('../providers');
const { Alias } = require('../models');

const axios = require("axios");

class WalletService {

    constructor() {
        this.localProvider = new LocalProvider();
    }

    async createWallet(name, currency) {
        try {
            const wallet = await this.localProvider.createWallet(currency);
        
            await Alias.createAlias(new Alias({
                name: name,
                address: wallet.address,
                currency: currency,
            }));
    
            return {name, wallet};

        } catch(err) {
            console.log(err);
        }
    }

    async getWallet(name) {
        const { address } = await Alias.readAlias(name);
        return this.localProvider.getWallet(address);
    }

    async getBalance(name) {
        const { address } = await Alias.readAlias(name);
        const url = `https://blockchain.info/balance?active=${address}`;
        const { data: { [address]: {final_balance: balance} } } = await axios.get(url);
        return balance;
    }
}

module.exports = WalletService;
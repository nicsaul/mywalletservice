const { ECPair, payments } = require('bitcoinjs-lib'); 
const { MyWallet } = require('../models');

class LocalProvider {

    constructor(/* keys */) {
        this.id = 'local';
    }

    async createWallet(currency) {
        try {
            const keyPair = ECPair.makeRandom();
            const { address }  = payments.p2pkh({ pubkey: keyPair.publicKey });
            const wallet = MyWallet.createWallet(new MyWallet( {
                publicKey: keyPair.publicKey,
                privateKey: keyPair.privateKey,
                address,
                currency
            }));

            return wallet;

        } catch(err) {
            console.log(err);
        }
    }

    async getWallet(address) {
        return await MyWallet.readWallet(address);
    }

    async getWallets() {
        return await MyWallet.readWallets();
    }
}

module.exports = LocalProvider;
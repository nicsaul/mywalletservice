// npm packages
const mongoose = require('mongoose');

// app imports
const { APIError } = require('../helpers');

// globals
const Schema = mongoose.Schema;

const walletSchema = new Schema({
  publicKey: String,
  privateKey: String,
  address: String, // publicKey hash
  currency: String,
});

walletSchema.statics = {
  /**
   * Create a Single New Wallet
   * @param {object} newWallet - an instance of Wallet
   * @returns {Promise<Wallet, APIError>}
   */
  async createWallet(newWallet) {
    const duplicate = await this.findOne({ address: newWallet.address });
    if (duplicate) {
      throw new APIError(
        409,
        'Wallet Already Exists',
        `There is already a wallet with address '${newWallet.address}'.`
      );
    }
    const wallet = await newWallet.save();
    return wallet.toObject();
  },

  /**
   * Get a single Wallet by address
   * @param {String} publicKey - the Wallet's address
   * @returns {Promise<Wallet, APIError>}
   */
  async readWallet(address) {
    const wallet = await this.findOne({ address });

    if (!wallet) {
      throw new APIError(404, 'Wallet Not Found', `No wallet with address: '${address}'.`);
    }
    return wallet.toObject();
  },
  /**
   * Get a list of Wallets
   * @param {Object} query - pre-formatted query to retrieve wallets.
   * @param {Object} fields - a list of fields to select or not in object form
   * @param {String} skip - number of docs to skip (for pagination)
   * @param {String} limit - number of docs to limit by (for pagination)
   * @returns {Promise<Wallets, APIError>}
   */
  async readWallets(query, fields, skip, limit) {
    const wallets = await this.find(query, fields)
      .skip(skip)
      .limit(limit)
      .exec();
    if (!wallets.length) {
      return [];
    }
    return wallets.map(wallet => wallet.toObject());
  },

};

/* Transform with .toObject to remove __v and _id from response */
if (!walletSchema.options.toObject) walletSchema.options.toObject = {};
walletSchema.options.toObject.transform = (doc, ret) => {
  const transformed = ret;
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

/** Ensure MongoDB Indices **/
walletSchema.index({ address: 1, number: 1 }, { unique: true }); // example compound idx

module.exports = mongoose.model('MyWallet', walletSchema);

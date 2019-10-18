// npm packages
const mongoose = require('mongoose');

// app imports
const { APIError } = require('../helpers');

// globals
const Schema = mongoose.Schema;

const aliasSchema = new Schema({
  name: String,
  address: String,
  currency: String,
});

aliasSchema.statics = {
  /**
   * Create a Single New Alias
   * @param {object} newAlias - an instance of Alias
   * @returns {Promise<Alias, APIError>}
   */
  async createAlias(newAlias) {
      console.log(newAlias);
    const duplicate = await this.findOne({ name: newAlias.name });
    if (duplicate) {
      throw new APIError(
        409,
        'Alias Already Exists',
        `There is already a alias with name '${newAlias.name}'.`
      );
    }
    const alias = await newAlias.save();
    return alias.toObject();
  },
  /**
   * Delete a single Alias
   * @param {String} name - the Alias's name
   * @returns {Promise<Alias, APIError>}
   */
  async deleteAlias(name) {
    const deleted = await this.findOneAndRemove({ name });
    if (!deleted) {
      throw new APIError(404, 'Alias Not Found', `No alias '${name}' found.`);
    }
    return deleted.toObject();
  },
  /**
   * Get a single Alias by name
   * @param {String} name - the Alias's name
   * @returns {Promise<Alias, APIError>}
   */
  async readAlias(name) {
    const alias = await this.findOne({ name });

    if (!alias) {
      throw new APIError(404, 'Alias Not Found', `No alias '${name}' found.`);
    }
    return alias.toObject();
  },
  /**
   * Get a list of Aliases
   * @param {Object} query - pre-formatted query to retrieve aliases.
   * @param {Object} fields - a list of fields to select or not in object form
   * @param {String} skip - number of docs to skip (for pagination)
   * @param {String} limit - number of docs to limit by (for pagination)
   * @returns {Promise<Aliases, APIError>}
   */
  async readAliases(query, fields, skip, limit) {
    const aliases = await this.find(query, fields)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 })
      .exec();
    if (!aliases.length) {
      return [];
    }
    return aliases.map(alias => alias.toObject());
  },
  /**
   * Patch/Update a single Alias
   * @param {String} name - the Alias's name
   * @param {Object} aliasUpdate - the json containing the Alias attributes
   * @returns {Promise<Alias, APIError>}
   */
  async updateAlias(name, aliasUpdate) {
    const alias = await this.findOneAndUpdate({ name }, aliasUpdate, {
      new: true
    });
    if (!alias) {
      throw new APIError(404, 'Alias Not Found', `No alias '${name}' found.`);
    }
    return alias.toObject();
  }
};

/* Transform with .toObject to remove __v and _id from response */
if (!aliasSchema.options.toObject) aliasSchema.options.toObject = {};
aliasSchema.options.toObject.transform = (doc, ret) => {
  const transformed = ret;
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

/** Ensure MongoDB Indices **/
aliasSchema.index({ name: 1, number: 1 }, { unique: true }); // example compound idx

module.exports = mongoose.model('Alias', aliasSchema);

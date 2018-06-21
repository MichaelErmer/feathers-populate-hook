'use strict';

module.exports = function populate (options, defaults) {

  defaults = defaults || {};

  /**
   * Example options:
   * messageService.after({
   *   find: [
   *     globalHooks.populate({
   *       user: { // Destination key
   *         service: 'users', // Foreign service
   *         f_key: 'id',  // Foreign key
   *         one: true // Optional, if only one resolve object is wanted
   *       },
   *       comments: { // Destination key
   *         service: 'comments', // Foreign service
   *         f_key: 'message',  // Foreign key
   *         l_key: 'id',  // Local key
   *        },
   *       resolvedCategories: { // Destination key
   *         service: 'categories', // Foreign service
   *         f_key: 'id',  // Foreign key
   *         l_key: 'categories' // Local key, optional, if different then destination key
   *       }
   *     })
   *   ]
   * })
   **/

  return function(hook) {

    /**
     * Block some populates from the client:
     * set query.$populate to {dontPopulateField: 0};
     * or
     * set query.$populate to false to block all populates
     **/
    let skip = {};
    if (hook.params.$populate==='false' || hook.params.$populate==='0' || hook.params.$populate===0) {
      hook.params.$populate = false;
    }
    if (hook.params.$populate || hook.params.$populate===false) {
      if (hook.params.$populate.constructor === Object) {
        Object.keys(hook.params.$populate).map(function(key) {
          if (!hook.params.$populate[key]) {
            skip[key] = true;
          }
        });
      }
      let skipAll = hook.params.$populate===false;
      delete hook.params.$populate;
      if (skipAll) {
        return hook;
      }
    }

    let populate = function(obj) {
      if (typeof obj.toObject === 'function') {
        // If it's a mongoose model then
        obj = obj.toObject();
      } else if (typeof obj.toJSON === 'function') {
        // If it's a Sequelize model
        obj = obj.toJSON();
      }
      let populateField = function(key) {
        if (skip[key]) {
          return;
        }
        let option = options[key];
        let value = obj[option.l_key||key];
        if (option.one) {
          if (!value) {
            return;
          }
          let params = Object.assign({}, hook.params, defaults.params, option.params);
          params.query = Object.assign({}, defaults.query, option.query);
          return hook.app.service(option.service).get(value, params).
            then(data => {
              obj[key] = data;
              return;
            });
        } else {
          let params = Object.assign({}, hook.params, defaults.params, option.params);
          params.query = Object.assign({}, defaults.query, option.query);
          if (Array.isArray(value)) {
            value = { $in: value };
          }
          params.query[option.f_key] = value;
          return hook.app.service(option.service).find(params).
            then(result => {
              let data = result.data || result;
              obj[key] = data;
              return;
            });
        }
      };
      return Promise.all(Object.keys(options).map(populateField));
    };

    if (hook.result) {
      if (hook.method === 'find' || Array.isArray(hook.result.data)) {
        return Promise.all((hook.result.data || hook.result).map(populate))
          .then(() => {
            return hook;
          });
      } else {
        return populate(hook.result)
          .then(() => {
            return hook;
          });
      }
    }
    return hook;
  };
};

module.exports.compatibility = function() {
  return function(hook) {
    // move query to params
    if (hook && hook.params && hook.params.query && typeof hook.params.query.$populate !== 'undefined') {
      hook.params.$populate = hook.params.query.$populate;
      delete hook.params.query.$populate;
    }
    return hook;
  };
};

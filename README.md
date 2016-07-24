# feathers-populate-hook

[![NPM](https://nodei.co/npm/feathers-populate-hook.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/feathers-populate-hook/)

Feathers hook to populate multiple fields with one to many, many to one and many to many relations. (For m:m cascade the populate hooks on a linking service.)

## Installation:

    npm install feathers-populate-hook

## Example setup:
```javascript
 const populate = require('feathers-populate-hook');

 messageService.after({
   find: [
     populate({
       user: { // Destination key
         service: 'users', // Foreign service
         f_key: 'id',  // Foreign key
         one: true // Optional, if only one resolve object is wanted
       },
       comments: { // Destination key
         service: 'comments', // Foreign service
         f_key: 'message',  // Foreign key
         l_key: 'id',  // Local key
        },
       resolvedCategories: { // Destination key
         service: 'categories', // Foreign service
         f_key: 'id',  // Foreign key
         l_key: 'categories' // Local key, optional, if different then destination key
       }
     })
   ]
 })
```

## Query options

Block some populates from the client:
set `query.$populate` to `{dontPopulateField: 0}` 

Block all populates:
set `query.$populate` to `false`

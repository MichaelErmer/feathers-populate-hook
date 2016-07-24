# feathers-populate-hook

Feathers hook to populate multiple fields with n:m, n:1 or 1:m relations.

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
```javascript

## Query options

Block some populates from the client:
set `query.$populate` to `{dontPopulateField: 0}` 
or 
set `query.$populate` to `false` to block all populates

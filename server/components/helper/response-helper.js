'use strict';

import jsonpatch from 'fast-json-patch';

export function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

export function patchUpdates(patches) {
  return function (entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch (err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

export function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
    return null;
  };
}

export function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

export function checkIfAvailable(res) {
  return function(entity) {
    var isAvailable = (entity == null);
    res.send(isAvailable);
  };
}

export function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    statusCode = err.code || statusCode;
    res.errorObj = err;
    res.status(statusCode).send(err);
  };
}

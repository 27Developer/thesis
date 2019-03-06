import { User, Role, Claim, UserToken } from './sqldb';
import config from './config/environment';
var jwt_decode = require('jwt-decode');

export function checkRole(...allowed) {
  return (req, res, next) => {
    var bearerToken;
    var bearerHeader = req.headers['authorization'];
    var bearer = bearerHeader.split(' ');
    bearerToken = bearer[1];
    UserToken.findOne({ where: { access_token: bearerToken } })
      .then(resObj => {
        var data = resObj.dataValues;
        var decoded = jwt_decode(data.token_id);
        var role = decoded['custom:role'];
        req.userData = {
          role: decoded['custom:role'],
          clientIds: decoded['custom:client_id'],
          collectionIds: decoded['custom:collection_id'],
          email: decoded['email'],
          name: decoded['name'],
          givenName: decoded['given_name']
        }
        Role.findAll({
          include: [
            {
              model: Claim
            }
          ],
          where: {
            is_active: true,
            code: role
          }
        })
          .then(data => {
            let roleLocal = data.length > 0 ? data[0].dataValues : {};
            let result = roleLocal.Claims.filter(function (e) {
              return allowed.indexOf(e.code) > -1;
            });
            if (result.length === 0) {
              res.status(403).json("Forbidden");
            } else {
              next();
            }
          })
          .catch(function (err) {
            res.status(403).json("Forbidden");
          });
      })
      .catch(err => {
        res.status(403).json("Forbidden");
      });
  }
}

export function checkRoleWithAssignedClients(...allowed) {
  return (req, res, next) => {
    var bearerToken;
    var bearerHeader = req.headers['authorization'];
    var bearer = bearerHeader.split(' ');
    bearerToken = bearer[1];
    UserToken.findOne({ where: { access_token: bearerToken } })
      .then(resObj => {
        var data = resObj.dataValues;
        var decoded = jwt_decode(data.token_id);
        var role = decoded['custom:role'];
        req.userData = {
          role: decoded['custom:role'],
          clientIds: decoded['custom:client_id'],
          collectionIds: decoded['custom:collection_id'],
          email: decoded['email'],
          name: decoded['name'],
          givenName: decoded['given_name']
        }

        User.findOne({ where: { email: decoded['email'] } })
          .then(user => {
            req.userData.clientIds = user.client_ids;
            Role.findOne({
              include: [
                {
                  model: Claim
                }
              ],
              where: {
                is_active: true,
                code: role
              }
            })
              .then(data => {
                let roleLocal = data ? data.dataValues : {};
                let result = roleLocal.Claims.filter(function (e) {
                  return allowed.indexOf(e.code) > -1;
                });
                if (result.length === 0) {
                  res.status(403).json("Forbidden");
                } else {
                  next();
                }
              })
              .catch(function (err) {
                res.status(403).json("Forbidden");
              });
          })
          .catch(err => {
            res.status(403).json("Forbidden");
          });
      })
  }
}

export function assignUserInfoToReq() {
  return (req, res, next) => {
    let bearerHeader = req.headers['authorization'];
    let accessToken = getAccessToken(bearerHeader);
    if (accessToken) {
      getCurrentUserInfo(accessToken).then(currentUserInfo => {
        if (currentUserInfo) {
          req.userData = currentUserInfo;
          next();
        } else {
          next();
        }
      });
    } else {
      next();
    }
  }
}

function getAccessToken(bearerHeader) {
  if (bearerHeader) {
    var bearer = bearerHeader.split(' ');
    if (bearer.length === 2) {
      return bearer[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
}

function getCurrentUserInfo(bearerToken) {
  return new Promise((resolve, reject) => {
    UserToken.findOne({ where: { access_token: bearerToken } })
    .then(resObj => {
      var data = resObj.dataValues;
      if (resObj.dataValues) {
        var decoded = jwt_decode(data.token_id);
        let userData = {
          role: decoded['custom:role'],
          clientIds: decoded['custom:client_id'],
          collectionIds: decoded['custom:collection_id'],
          email: decoded['email'],
          name: decoded['name'],
          givenName: decoded['given_name']
        };
        resolve(userData);
      } else {
        return null;
      }
    })
    .catch(err => {
      console.log(err);
      resolve(null);
    });
  });
}


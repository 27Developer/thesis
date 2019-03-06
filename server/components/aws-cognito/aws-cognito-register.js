'use strict';

import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser,
  CognitoIdentityServiceProvider,
} from 'amazon-cognito-identity-js'

import config from '../../config/environment';
var aws = require('aws-sdk')

aws.config.region = config.region;
aws.config.update({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
});
aws.config.credentials = new aws.CognitoIdentityCredentials({
  IdentityPoolId: config.IdentityPoolId,
});
const cognitoIdentityService = new aws.CognitoIdentityServiceProvider({
  apiVersion: config.apiVersion,
  region: config.region
});

var awsCognito = [];

var registerUserPool = function () {

  let poolData = {
    UserPoolId: config.UserPoolId,
    ClientId: config.ClientId
  };
  let userPool = new CognitoUserPool(poolData);
  return userPool;
}

var registerCognitoUser = function (username) {
  let userData = {
    Username: username.toLowerCase(),
    Pool: registerUserPool()
  };
  let cognitoUser = new CognitoUser(userData);
  return cognitoUser;
}

awsCognito.createUser = function (user) {
  let attributeList = [];

  let dataEmail = {
    Name: 'email',
    Value: user.email.toLowerCase() || ' '
  };
  let dataPhoneNumber = {
    Name: 'phone_number',
    Value: user.phone || ' '
  };
  let dataGivenName = {
    Name: 'given_name',
    Value: user.firstName || ' '
  };
  let name = {
    Name: 'name',
    Value: user.lastName || ' '
  };
  let nickname = {
    Name: 'nickname',
    Value: user.nickName || ' '
  };
  let role = {
    Name: 'custom:role',
    Value: user.role || ' '
  };

  let clientId = {
    Name: 'custom:client_id',
    Value: user.clientId || ' '
  };

  let collectionId = {
    Name: 'custom:collection_id',
    Value: user.collectionId || ' '
  };

  let attributeEmail = new CognitoUserAttribute(dataEmail);
  let attributePhoneNumber = new CognitoUserAttribute(dataPhoneNumber);
  let attributeGivenName = new CognitoUserAttribute(dataGivenName);
  let attributeNickname = new CognitoUserAttribute(nickname);
  let attributeName = new CognitoUserAttribute(name);
  let attributeRole = new CognitoUserAttribute(role);
  let attributeclientId = new CognitoUserAttribute(clientId);
  let attributeCollectionId = new CognitoUserAttribute(collectionId);

  attributeList.push(attributeEmail);
  attributeList.push(attributePhoneNumber);
  attributeList.push(attributeGivenName);
  attributeList.push(attributeNickname);
  attributeList.push(attributeName);
  attributeList.push(attributeRole);
  attributeList.push(attributeclientId);
  attributeList.push(attributeCollectionId);

  return new Promise(resolve => {
      registerUserPool().signUp(user.email, user.password, attributeList, null, function (err, result) {
        if (err) {
          resolve(err);
        } else {
          var cognitoUser = result.user;
          resolve(cognitoUser)
        }
      });
    }
  );
}

awsCognito.login = function (user) {
  var authenticationData = {
    Username: user.email.toLowerCase(),
    Password: user.password,
  };
  return new Promise(resolve => {
    var authenticationDetails = new AuthenticationDetails(authenticationData);
    var cognitoUser = registerCognitoUser(user.email);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        resolve(result);
      },
      onFailure: function (err) {
        resolve(err);
      },
      newPasswordRequired: function(userAttributes, requiredAttributes) {
        // User was signed up by an admin and must provide new
        // password and required attributes, if any, to complete
        // authentication.

        // the api doesn't accept this field back
        delete userAttributes.email_verified;

        // Get these details and call
        cognitoUser.completeNewPasswordChallenge("Spotlight!", userAttributes, this);
    }
    });
  });
}

awsCognito.confirmRegistration = function (code, username) {
  return new Promise(resolve => {
    var cognitoUser = registerCognitoUser(username);
    cognitoUser.confirmRegistration(code, true, function (err, result) {
      if (err) {
        resolve(err)
      } else {
        resolve(result)
      }
    });
  });
}

awsCognito.changePassword = function (username, oldPassword, newPassword) {
  return new Promise(resolve => {
    var cognitoUserTemp = registerCognitoUser(username);
    var authenticationData = {
      Username: username,
      Password: oldPassword,
    };
    var authenticationDetails = new AuthenticationDetails(authenticationData);
    cognitoUserTemp.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        cognitoUserTemp.changePassword(oldPassword, newPassword, function (err, result) {
          if (err) {
            resolve(err)
          } else {
            resolve(result)
          }
        });
      },
      onFailure: function (err) {
        resolve(err);
      },
    });
  });
}

awsCognito.forgotPassword = function (username) {
  var params = {
    ClientId: config.ClientId,
    Username: username,
  };
  return new Promise(resolve => {
    cognitoIdentityService.forgotPassword(params, function (err, data) {
      if (err) {
        resolve(err);
      }
      else {
        resolve(data);
      }
    });
  });
}

awsCognito.confirmForgotPassword = function (code, username, newPassword) {
  var params = {
    ClientId: config.ClientId,
    ConfirmationCode: code,
    Password: newPassword,
    Username: username
  };
  return new Promise(resolve => {
    cognitoIdentityService.confirmForgotPassword(params, function (err, data) {
      if (err) {
        resolve(err);
      }
      else {
        resolve(data);
      }
    });
  });
}

awsCognito.signOut = function (username) {
  var cognitoUser = registerCognitoUser(username);
  cognitoUser.signOut();
}

awsCognito.updateAttribute = function (username, attributeName, value) {
  var params = {
    UserAttributes: [
      {
        Name: attributeName,
        Value: value
      },
    ],
    UserPoolId: config.UserPoolId,
    Username: username
  };

  return new Promise(resolve => {
    cognitoIdentityService.adminUpdateUserAttributes(params, function (err, data) {
      if (err) {
        resolve(err);
      }
      else {
        resolve(data)
      }
    });

  });
}

awsCognito.getListUser = function (filter, paginationToken) {
  let listUser = {
    Users: []
  }
  return new Promise(resolve => {
    var getList = function (filter, paginationToken) {
      var params = {
        UserPoolId: config.UserPoolId,
        AttributesToGet: null,
        Filter: filter,
        PaginationToken: paginationToken
      };
      cognitoIdentityService.listUsers(params, function (err, data) {
        if (err) {
          resolve(err);
        }
        else {
          if (data.PaginationToken) {
            getList(null, data.PaginationToken)
            listUser.Users = [...listUser.Users, ...data.Users];
          } else {
            listUser.Users = [...listUser.Users, ...data.Users];
            resolve(listUser);
          }
        }
      });
    }
    getList();
  });
}

awsCognito.getListUserFilter = function (filter) {
  var params = {
    UserPoolId: config.UserPoolId,
    AttributesToGet: null,
    Filter: filter,
  };
  return new Promise(resolve => {
    cognitoIdentityService.listUsers(params, function (err, data) {
      if (err) {
        resolve(err);
      }
      else {
        resolve(data);
      }
    });
  });
}


awsCognito.resendConfirmationCode = function (username) {
  var cognitoUser = registerCognitoUser(username);
  return new Promise(resolve => {
    cognitoUser.resendConfirmationCode(function (err, result) {
      if (err) {
        resolve(err)
      } else {
        resolve(result)
      }
    });
  });
}

awsCognito.adminEnableUser = function (username) {
  var params = {
    UserPoolId: config.UserPoolId,
    Username: username,
  };
  return new Promise(resolve => {
    cognitoIdentityService.adminEnableUser(params, function (err, data) {
      if (err) {
        resolve(err);
      }
      else {
        resolve(data);
      }
    });
  });
}

awsCognito.adminDisableUser = function (username) {
  var params = {
    UserPoolId: config.UserPoolId,
    Username: username,
  };
  return new Promise(resolve => {
    cognitoIdentityService.adminDisableUser(params, function (err, data) {
      if (err) {
        resolve(err);
      }
      else {
        resolve(data);
      }
    });
  });
}

export default awsCognito;

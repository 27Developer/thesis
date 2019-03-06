'use strict';
import log4Js from 'log4js/lib/log4js';
import {   
  sequelize,
  User,
  Media
} from '../../sqldb';
import _ from 'lodash';
var Promise = require('bluebird');

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-controller.log', category: 'client-controller' }
  ]
});

export function searchGlobal(keyword) {
  return new Promise((resolve, reject) => {
    let keywordArray = _.filter(keyword.split(' '), item => {
      return item.length && item.length > 1;
    });
    var query = `
    SELECT a.id as id, a.name as name, "Analyst" as type
    FROM (SELECT a.id, a.name FROM analyst as a ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'a.name', true) + 
    ` ORDER BY a.name LIMIT 10 offset 0) as a

     union all

     (SELECT c.id as id, c.name as name, "Client" as type
     FROM client as c ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'c.name', true) +  
     ` ORDER BY name LIMIT 10 offset 0)
    
     union

     (SELECT e.id as id, e.name as name, "Event" as type
     FROM event as e ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'e.name', false) +
     ` ORDER BY name LIMIT 10 offset 0)
    
    union
    
    (SELECT cate.id as id, cate.desc as name, "Category" as type
    FROM research as cate ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'cate.desc', true) +
    ` ORDER BY cate.desc LIMIT 10 offset 0)
    
    union
    
    (SELECT r.id as id, r.name as name, "Report" as type
    FROM ranking_report as r ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'r.name', true) +
    ` ORDER BY r.name LIMIT 10 offset 0)

    union
    
    (SELECT cl.id as id, cl.name as name, "Collection" as type
    FROM collection as cl ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'cl.name', false) +
    ` ORDER BY cl.name LIMIT 10 offset 0)

    union
    
    (SELECT mk.id as id, mk.name as name, "Market" as type
    FROM market as mk ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'mk.name', false) +
    ` ORDER BY mk.name LIMIT 10 offset 0)

    union
    
    (SELECT f.id as id, f.name as name, "Firm" as type
    FROM firm as f ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'f.name', true) +
    ` ORDER BY f.name LIMIT 10 offset 0)

    union
    
    (SELECT atv.id as id, atv.name as name, "Activity" as type
    FROM activity as atv ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'atv.name', false) +
    ` ORDER BY atv.name LIMIT 10 offset 0)`;

    var countQuery = `
    SELECT count(a.id) as count, "Analyst" as type
    FROM (SELECT a.id, a.name FROM analyst as a ` +  this.generateWhereAndQueryByKeyWordArray(keywordArray ,'a.name', true) +  `) as a

    union all

    (SELECT count(c.id) as count, "Client" as type
    FROM client as c ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'c.name', true) + `)
    
    union

    (SELECT count(e.id) as count, "Event" as type
    FROM event as e ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'e.name', false) +`)
    
    union
    
    (SELECT count(cate.id) as count, "Category" as type
    FROM research as cate ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'cate.desc', true) + `)
    
    union
    
    (SELECT count(r.id) as count, "Report" as type
    FROM ranking_report as r `  + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'r.name', true) + `)

     union
    
    (SELECT count(cl.id) as count, "Collection" as type
    FROM collection as cl ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'cl.name', false) + `)

    union
    
    (SELECT count(mk.id) as count, "Market" as type
    FROM market as mk ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'mk.name', false) + `)

    union
    
    (SELECT count(f.id) as count, "Firm" as type
    FROM firm as f `  + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'f.name', true) + `)

    union
    
    (SELECT count(atv.id) as count, "Activity" as type
    FROM activity as atv ` + this.generateWhereAndQueryByKeyWordArray(keywordArray ,'atv.name', false) + `)`;
   
        
    var returnObj = {
      data: [],
      count: {}
    }
    return sequelize.query(query, { replacements: { keyword: `%${keyword}%` }, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        returnObj.data = data;
        return sequelize.query(countQuery, { replacements: { keyword: `%${keyword}%` }, type: sequelize.QueryTypes.SELECT });
      })
      .then(data => {
        data.forEach(object => {
          returnObj.count[object.type] = object.count;
        })
        resolve(returnObj);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function generateWhereAndQueryByKeyWordArray(keyWordArray, keywordField, isIncludeActive) {  
  let whereQuery = {};
  let whereKeywordQueries = _.map(keyWordArray, keyword => {
    let queryItem = {};
   
    queryItem[keywordField] = {$like : '%' + keyword +'%'};
    keyword;
    return queryItem;
  });
  if(isIncludeActive){    
    whereKeywordQueries.push({'is_active': {
      $eq: 1
    }});
  }
  whereQuery['$and'] = whereKeywordQueries;    
  let generateSelectQueryString = _.replace(sequelize.dialect.QueryGenerator.whereQuery(whereQuery), /`/g, '');  
  return generateSelectQueryString;
}


export function updateUserRecord(userData) {
  return new Promise((resolve, reject) => {

    return User.findOne({ where: { email: userData.email } })
      .then(data => {
        if (data) {
          User.update({ full_name: userData.given_name + ' ' + userData.name }, { where: { email: userData.email } })
          return data;
        } else {
          var newUser = {
            email: userData.email,
            is_active: true,
            access_token: userData.access_token,
            token_id: userData.token_id,
            first_login: false,
            full_name: userData.given_name + ' ' + userData.name
          }
          return User.create(newUser);
        }
      }).then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      })
  })
}


export function getImageById(mediaId) {
  return new Promise((resolve, reject) => {
    let query = {};
    query.attributes = ['media_id', 'media_name', 'media_data', 'small_media_data'];
    query.where = {
      media_id: mediaId,
      is_active: true
    }
    return Media.findOne(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error)
        reject(error);
      })
  })
}

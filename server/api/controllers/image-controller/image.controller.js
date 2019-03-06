'use strict';
import log4Js from 'log4js';
import {
  Media,
  ClientMedia,
  AnalystMedia,
  ClientSpeakerMedia,
  sequelize,
} from '../../../sqldb';

var CommonService = require('../../services/common.service');
import * as responseHelper from '../../../components/helper/response-helper';

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/image-controller.log', category: 'image-controller' }
  ]
});
var logger = log4Js.getLogger('image-controller');

export function getImageById(req, res) {
  var isSmall = req.query.small == 1 ? true : false;
  CommonService.getImageById(req.params.id)
    .then(data => {
      //var img = new Buffer(data, 'base64');
      var imgBase64 = isSmall && data.small_media_data ?  data.small_media_data.toString('utf8') : data.media_data.toString('utf8');
      imgBase64 = imgBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      var img = new Buffer(imgBase64, 'base64');

      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
      });
      res.end(img);
    })
    .catch(responseHelper.handleError(res));
}
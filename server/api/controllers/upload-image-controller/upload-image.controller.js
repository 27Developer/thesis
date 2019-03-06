'use strict';
import log4Js from 'log4js';
import {
  Media,
  ClientMedia,
  AnalystMedia,
  ClientSpeakerMedia,
  sequelize,
} from '../../../sqldb';

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/upload-image-controller.log', category: 'upload-image-controller' }
  ]
});
var logger = log4Js.getLogger('upload-image-controller');
var sharp = require('sharp');

export function uploadImage(req, res) {
  try {
    var image = req.body.image;
    var fileName = image.name;
    var value = image.result;

    return sequelize.transaction(async function (t) {
      var checkExists = await ClientMedia.findAll({
        where: { client_id: image.clientId, is_active: 1, media_type: 'avatar' },
        attributes: [
          'client_id'
        ]
      }).catch((err) => {
        console.log(err);
      });
      if (checkExists.length > 0) {
        await ClientMedia.update({
          is_active: 0,
        }, { where: { client_id: image.clientId, media_type: 'avatar' } }, { transaction: t });
      }
      // Create new
      var media = await Media.create({
        media_name: fileName,
        is_active: 1,
        media_data: value,
      }, { transaction: t });
      // Update current image status
      await ClientMedia.update({
        is_active: 0,
      }, { where: { client_id: image.clientId, media_type: 'avatar' } }, { transaction: t });
      // Add new image
      await ClientMedia.create({
        client_id: image.clientId,
        media_id: media.media_id,
        media_type: 'avatar',
        created_date: new Date(),
        is_active: 1
      }, { transaction: t });

      var query = {};
      query.where = { media_id: media.media_id };

      var imgBase64 = value.toString('utf8');
      imgBase64 = imgBase64.replace(/^data:image\/[a-z]+;base64,/, "");

      var inputBuffer = Buffer.from(imgBase64, 'base64');

      return sharp(inputBuffer)
        .resize(37, 37, {
          kernel: sharp.kernel.nearest
        })
        .toBuffer((err, buffer) => {
          if (buffer) {
            var newImg = `data:image/png;base64, ` + buffer.toString('base64');
            var blob = new Buffer(newImg, 'utf8');
            return Media.update({ small_media_data: blob }, query);
          }
        });
    }).then(() => {
      res.send();
    })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}


export function uploadAnalystImage(req, res) {
  try {
    var image = req.body.image;
    var fileName = image.name;
    var value = image.result;
    var type = image.type;

    return sequelize.transaction(async function (t) {
      var checkExists = await AnalystMedia.findAll({
        where: { analyst_id: image.analystId, is_active: 1, media_type: type },
        attributes: [
          'analyst_id'
        ]
      }).catch((err) => {
        console.log(err);
      });
      if (checkExists.length > 0) {
        await AnalystMedia.update({
          is_active: 0,
        }, { where: { analyst_id: image.analystId, media_type: type } }, { transaction: t });
      }
      // Create new
      var media = await Media.create({
        media_name: fileName,
        is_active: 1,
        media_data: value,
        created_date: new Date(),
      }, { transaction: t });
      // Update current image status
      await AnalystMedia.update({
        is_active: 0,
      }, { where: { analyst_id: image.analystId, media_type: type } }, { transaction: t });
      // Add new image
      await AnalystMedia.create({
        analyst_id: image.analystId,
        media_id: media.media_id,
        media_type: type,
        is_active: 1
      }, { transaction: t });

      var query = {};
      query.where = { media_id: media.media_id };

      var imgBase64 = value.toString('utf8');
      imgBase64 = imgBase64.replace(/^data:image\/[a-z]+;base64,/, "");

      var inputBuffer = Buffer.from(imgBase64, 'base64');

      return sharp(inputBuffer)
        .resize(37, 37, {
          kernel: sharp.kernel.nearest
        })
        .toBuffer((err, buffer) => {
          if (buffer) {
            var newImg = `data:image/png;base64, ` + buffer.toString('base64');
            var blob = new Buffer(newImg, 'utf8');
            return Media.update({ small_media_data: blob }, query);
          }
        });
    }).then(() => {
      res.send();
    })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function uploadClientSpeakerImage(req, res) {
  try {
    var image = req.body.image;
    var fileName = image.name;
    var value = image.result;
    var type = image.type;

    return sequelize.transaction(async function (t) {
      var checkExists = await ClientSpeakerMedia.findAll({
        where: { client_speaker_id: image.clientSpeakerId, is_active: 1, media_type: type },
        attributes: [
          'client_speaker_id'
        ]
      }).catch((err) => {
        console.log(err);
      });
      if (checkExists.length > 0) {
        await ClientSpeakerMedia.update({
          is_active: 0,
        }, { where: { client_speaker_id: image.clientSpeakerId, media_type: type } }, { transaction: t });
      }
      // Create new
      var media = await Media.create({
        media_name: fileName,
        is_active: 1,
        media_data: value,
        created_date: new Date(),
      }, { transaction: t });
      // Update current image status
      await ClientSpeakerMedia.update({
        is_active: 0,
      }, { where: { client_speaker_id: image.clientSpeakerId, media_type: type } }, { transaction: t });
      // Add new image
      await ClientSpeakerMedia.create({
        client_speaker_id: image.clientSpeakerId,
        media_id: media.media_id,
        media_type: type,
        is_active: 1
      }, { transaction: t });

      var query = {};
      query.where = { media_id: media.media_id };

      var imgBase64 = value.toString('utf8');
      imgBase64 = imgBase64.replace(/^data:image\/[a-z]+;base64,/, "");

      var inputBuffer = Buffer.from(imgBase64, 'base64');

      return sharp(inputBuffer)
        .resize(37, 37, {
          kernel: sharp.kernel.nearest
        })
        .toBuffer((err, buffer) => {
          if (buffer) {
            var newImg = `data:image/png;base64, ` + buffer.toString('base64');
            var blob = new Buffer(newImg, 'utf8');
            return Media.update({ small_media_data: blob }, query);
          }
        });
    }).then(() => {
      res.send();
    })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

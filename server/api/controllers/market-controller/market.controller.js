import config from '../../../config/environment';
import * as responseHelper from '../../../components/helper/response-helper';

import {
  sequelize,
} from '../../../sqldb';
var marketService = require('../../services/market.service');

export function getListMarket(req, res) {
  marketService.getListMarket()
    .then(data => {
      res.send(data);
    })
    .catch(
      err => {
        throw err;
      }
    );
}

export function addMarket(req, res) {
  let market = req.body.market;
  marketService.addMarket(market)
    .then(data => {
      res.send(data);
    })
    .catch(
      err => {
        throw err;
      }
    );
}

export function editMarket(req, res) {
  let market = req.body.market;
  marketService.editMarket(market)
    .then(data => {
      res.send(data);
    })
    .catch(
      err => {
        throw err;
      }
    );
}

export function getMarketById(req, res) {
  let marketId = req.query.id;
  marketService.getMarketById(marketId)
    .then(data => {
      res.send(data);
    })
    .catch(
      err => {
        throw err;
      }
    );
}

export function deleteMarket(req, res) {
  let arrayIds = req.query.arrayIds;
  marketService.deleteMarket(arrayIds)
    .then(data => {
      res.send(data);
    })
    .catch(
      err => {
        throw err;
      }
    );
}

export function getAnalystForMarket(req, res) {
  let arrayIds = req.query.arrayIds;
  marketService.getAnalystForMarket(arrayIds)
    .then(data => {
      res.send(data);
    })
    .catch(
      err => {
        throw err;
      }
    );
}

export function getFirmForMarket(req, res) {
  let arrayIds = req.query.arrayIds;
  marketService.getFirmForMarket(arrayIds)
    .then(data => {
      res.send(data);
    })
    .catch(
      err => {
        throw err;
      }
    );
}

export function getReportForMarket(req, res) {
  let arrayIds = req.query.arrayIds;
  marketService.getReportForMarket(arrayIds)
    .then(data => {
      res.send(data);
    })
    .catch(
      err => {
        throw err;
      }
    );
}

export function getClientForMarket(req, res) {
  let arrayIds = req.query.arrayIds;
  marketService.getClientForMarket(arrayIds)
    .then(data => {
      res.send(data);
    })
    .catch(
      err => {
        throw err;
      }
    );
}


export function getAnalystByMarketId(req, res) {
  let marketId = req.query.market_id;
  marketService.getAnalystByMarketId(marketId)
    .then(data => { res.send(data); })
    .catch(err => { throw err; }
    );
}


export function getEventByMarketId(req, res) {
  let marketId = req.query.market_id;
  marketService.getEventByMarketId(marketId)
    .then(data => { res.send(data); })
    .catch(err => { throw err; }
    );
}

export function getReportByMarketId(req, res) {
  let marketId = req.query.market_id;
  marketService.getReportByMarketId(marketId)
    .then(data => { res.send(data); })
    .catch(err => { throw err; }
    );
}

export function getListInsightByMarketId(req, res) {
  let marketId = req.query.market_id;
  marketService.getListInsightByMarketId(marketId)
    .then(data => { res.send(data); })
    .catch(err => { throw err; }
    );
}

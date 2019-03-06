/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import sqldb from '../sqldb';
import config from './environment/';

export default function seedDatabaseIfNeeded() {
  if (config.seedDB) {
    let seedData = {};
    seedData.Cohort = sqldb.Cohort;
    seedData.SegmentationType = sqldb.SegmentationType;
    seedData.ClientType = sqldb.ClientType;
    seedData.ChurnReason = sqldb.ChurnReason;
    seedData.Effort = sqldb.Effort;
    seedData.AnalystFirmSubscriptionType = sqldb.AnalystFirmSubscriptionType;
    seedData.ResearchType = sqldb.ResearchType;
    seedData.VendorLeaning = sqldb.VendorLeaning;
    seedData.Research = sqldb.Research;
    seedData.Firm = sqldb.Firm;

    //Cohort
    seedData.Cohort.findAll()
      .then((result) => {
        if (result.length == 0) {
          seedData.Cohort.bulkCreate([{
            name: 'AdTech'
          }, {
            name: 'Advocacy'
          }, {
            name: 'Agency'
          }, {
            name: 'AppDev'
          }, {
            name: 'Commerce'
          }, {
            name: 'Content'
          }, {
            name: 'Management'
          }, {
            name: 'CX'
          }, {
            name: 'Data'
          }, {
            name: 'DXSP'
          }, {
            name: 'Innovation'
          }, {
            name: 'MarTech'
          }, {
            name: 'Mega'
          }, {
            name: 'Misfits'
          }
          ])
            .then(() => console.log('Finished populating Cohort'))
            .catch(err => console.log('Error populating Cohort', err));
        }
      });

    //Segmentation Type
    seedData.SegmentationType.findAll()
      .then((result) => {
        if (result.length == 0) {
          seedData.SegmentationType.bulkCreate([{
            desc: 'Strategic'
          }, {
            desc: 'Key Account'
          }, {
            desc: 'Rookie'
          }, {
            desc: 'Reference'
          }, {
            desc: 'Maintenance'
          }
          ])
            .then(() => console.log('Finished populating Segmentation Type'))
            .catch(err => console.log('Error populating Segmentation Type', err));
        }
      });

    //ClientType
    seedData.ClientType.findAll()
      .then((result) => {
        if (result.length == 0) {
          seedData.ClientType.bulkCreate([{
            desc: 'Service'
          }, {
            desc: 'Platform'
          }, {
            desc: 'Hybrid'
          }
          ])
            .then(() => console.log('Finished populating Client Type'))
            .catch(err => console.log('Error populating Client Type', err));
        }
      });

    //ChurnReason
    seedData.ChurnReason.findAll()
      .then((result) => {
        if (result.length == 0) {
          seedData.ChurnReason.bulkCreate([{
            desc: 'Financial'
          }, {
            desc: 'Organizational'
          }, {
            desc: 'Delivery'
          }
          ])
            .then(() => console.log('Finished populating Churn Reason'))
            .catch(err => console.log('Error populating Churn Reason', err));
        }
      });

    //Effort
    seedData.Effort.findAll()
      .then((result) => {
        if (result.length == 0) {
          seedData.Effort.bulkCreate([{
            code: 1,
            desc: 'High'
          }, {
            code: 2,
            desc: 'Med/High'
          }, {
            code: 3,
            desc: 'Medium'
          }, {
            code: 4,
            desc: 'Low/Med'
          }, {
            code: 5,
            desc: 'Low'
          }
          ])
            .then(() => console.log('Finished populating Effort'))
            .catch(err => console.log('Error populating Effort', err));
        }
      });

    //Analyst Firm Subscription Type
    seedData.AnalystFirmSubscriptionType.findAll()
      .then((result) => {
        if (result.length == 0) {
          seedData.AnalystFirmSubscriptionType.bulkCreate([{
            desc: 'Forrester'
          }, {
            desc: 'Gartner'
          }, {
            desc: 'Other'
          }
          ])
            .then(() => console.log('Finished populating Analyst Firm Subscription Type'))
            .catch(err => console.log('Error populating Analyst Firm Subscription Type', err));
        }
      });

    //Firm
    seedData.Firm.findAll()
      .then((result) => {
        if (result.length == 0) {
          seedData.Firm.bulkCreate([{
            is_active: true,
            name: 'Triple'
          }, {
            is_active: true,
            name: 'Quadra'
          }, {
            is_active: true,
            name: 'Penta'
          }
          ])
            .then(() => console.log('Finished populating Firm'))
            .catch(err => console.log('Error populating Firm', err));
        }
      });

    //Research Type
    seedData.ResearchType.findAll()
      .then((result) => {
        if (result.length == 0) {
          seedData.ResearchType.bulkCreate([{
            is_active: true,
            desc: 'Platform'
          }, {
            is_active: true,
            desc: 'Service'
          }, {
            is_active: true,
            desc: 'Hybrid'
          }
          ])
            .then(() => console.log('Finished populating Research Type'))
            .catch(err => console.log('Error populating Research Type', err));
        }
      });

    //Vendor Leaning
    seedData.VendorLeaning.findAll()
      .then((result) => {
        if (result.length == 0) {
          seedData.VendorLeaning.bulkCreate([{
            desc: 'Positive'
          }, {
            desc: 'Neutral'
          }, {
            desc: 'Negative'
          }
          ])
            .then(() => console.log('Finished populating Vendor Leaning'))
            .catch(err => console.log('Error populating Vendor Leaning', err));
        }
      });

    //Research
    seedData.Research.findAll()
      .then((result) => {
        if (result.length == 0) {
          seedData.Research.bulkCreate([{
            desc: 'Apple'
          }, {
            desc: 'Durian'
          }, {
            desc: 'Mango'
          }
          ])
            .then(() => console.log('Finished populating Research'))
            .catch(err => console.log('Error populating Research', err));
        }
      });

    return seedData;
  }
}

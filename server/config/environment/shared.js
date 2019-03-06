'use strict';

module.exports = {
  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  hostedDomain: 'spotlightar.com',

  alertLoginWithDifferentDomain: 'The Google user account you attempted to logon with is not valid. Please try again.',

  clientPage: '/clients',
  homePage: '/home',
  myFeedPage: '/my-feed',
  collectionPage: '/collection',
  termsPage: '/terms?redirect_uri=',
  clientMasterView: '/clients/client-master-view?clientId=:idClient',
  clientOverview: 'clients/client-profile/overview?clientId=:idClient',
  collectionOverview: 'collection/collection-profile/overview?collectionId=:idCollection',

  etlProcessSuccessMessage: 'Spotlight Oz was updated successfully with ErrorCount errors at TimeLocal on DateLocal',

  etlProcessFailMessage: 'Spotlight Oz failed at TimeLocal on DateLocal: ErrorMessage.',

  interactionTypeUpdateProcessSuccessMessage: 'The Tag Filter was updated successfully at TimeLocal on DateLocal',

  interactionTypeUpdateProcessFailMessage: 'The Tag Filter update failed with the following issue: ErrorMessage.',

  limitFileSizeText: 'The file size can not exceed 5Mb',

  messageSaveSuccess: 'Save successful!',
  messageSaveFail: 'Save failed!',
  messageDuplicate: 'Duplicated value',
  messageNullItemValue: 'Item value is blank',
  messageNullInfoGroup: 'Info Group is blank',
  messageNullItemName: 'Item is blank',
  messageDeleteSuccess: 'Delete successful!',
  messageDeleteFail: 'Delete failed!',
  messageSaveExist: 'Save failed! The record already exists',
  messageUpdateSuccess: 'Update successful!',
  messageUserUpdateSuccess: 'User Updated',
  messageUpdateFail: 'Update Failed!',
  messageUpdatePassword: 'Successful',
  messageInsightCopyToClipboard: 'Insight link has been copied to clipboard.',
  messageLinkCopied: 'Link Copied',
  messageInsightAutosaveSuccess: 'This insight has been autosaved!',
  messageInsightAutoCreatedSuccess: 'An insight was created!',

  errorConstant: 'error',
  successConstant: 'success',

  messagePasswordMatch: 'The passwords you have entered do not match.',

  messagePasswordLong: 'Your password must be at least 8 characters long.',

  messageRequired: 'The Client filed should be required',

  messageRequiredCollection: 'The Collection filed should be required',

  invalidEmail: 'Invalid email. Please try again',

  forgotSuccess: 'An email has been sent to reset password.',

  duplicateAnalystName: 'This analyst name is duplicate. Please choose another one.',

  configConstant: 'forgot',

  limitFileSize: 5242880,

  inactiveUser: 'The username you entered is inactive',

  incorrectUsernamePassword: 'Incorrect username or password!',

  disableUser: 'User is disabled',

  activityDetailConstant: 'Activity Details',

  role: {
    spotlightAdmin: 'SPOTLIGHT_ADMIN',
    spotlightClientEdit: 'SPOTLIGHT_CLIENT_EDIT',
    spotlightClientView: 'SPOTLIGHT_CLIENT_VIEW',
  },

  claim: {
    spotlightSeeNavigation: 'SEE_NAVIGATION',
    spotlightReadOnly: 'READ_ONLY',
    spotlightClientHealth: 'CLIENT_HEALTH',
    spotlightClientEdit: 'CLIENT_EDIT',
    spotlightBriefingRequest: 'BRIEFING_REQUEST'
  },

  firm: {
    forrester: 'Forrester',
    gartner: 'Gartner'
  },

  taskType: {
    briefing: 'Briefing'
  },

  analystType: {
    nonAnalyst: '1'
  },

  briefingType: [
    {
      id: 'Company Introduction',
      name: 'Company Introduction',
    }, {
      id: 'New Product On The Market',
      name: 'New Product On The Market',
    }, {
      id: 'New Product In Beta',
      name: 'New Product in Beta',
    }, {
      id: 'Product Update',
      name: 'Product Update',
    }, {
      id: 'New Services',
      name: 'New Services',
    }, {
      id: 'Service Update',
      name: 'Service Update',
    }, {
      id: 'Strategic Shift',
      name: 'Strategic Shift',
    }, {
      id: 'Organizational Shift',
      name: 'Organizational Shift',
    }, {
      id: 'Other',
      name: 'Other',
    }
  ],

  targetAudience: [
    {
      id: 'Technology Management',
      name: 'TECHNOLOGY MANAGEMENT',
    }, {
      id: 'Application Development & Delivery',
      name: '--- Application Development & Delivery',
    }, {
      id: 'CIO',
      name: '--- CIO',
    }, {
      id: 'Enterprise Architecture',
      name: '--- Enterprise Architecture',
    }, {
      id: 'Infrastructure & Operations',
      name: '--- Infrastructure & Operations',
    }, {
      id: 'Security & Risk',
      name: '--- Security & Risk',
    }, {
      id: 'Sourcing & Vendor Management',
      name: '--- Sourcing & Vendor Management',
    }, {
      id: 'Marketing & Strategy',
      name: 'MARKETING & STRATEGY',
    }, {
      id: 'B2B Marketing',
      name: '--- B2B Marketing',
    }, {
      id: 'B2C Marketing',
      name: '--- B2C Marketing',
    }, {
      id: 'CMO',
      name: '--- CMO',
    }, {
      id: 'Customer Experience',
      name: '--- Customer Experience',
    }, {
      id: 'Customer Insights',
      name: '--- Customer Insights',
    }, {
      id: 'eBusiness & Channel Strategy',
      name: '--- eBusiness & Channel Strategy',
    }, {
      id: 'Technology Industry',
      name: 'TECHNOLOGY INDUSTRY',
    }, {
      id: 'Analyst Relations',
      name: '--- Analyst Relations',
    }, {
      id: 'Other',
      name: 'Other',
    }
  ],

  briefingDescription: 'Spotlight on behalf of :clientName. Please schedule this interaction through :username, :email',

  forresterUrl: 'https://www.forrester.com/reg/briefing.xhtml?',

  gartnerUrl: 'https://www.gartner.com/analyst/vendor-briefing?',

  forresterLoginUrl: 'https://www.forrester.com/reg/loginfull.xhtml',

  gartnerLoginUrl: 'https://www.gartner.com/login/loginInitAction.do?method=initialize',

  extensionUrl: 'https://chrome.google.com/webstore/detail/bibkicccfpmncimpenkfbgimmhffjkhc',

  requestBriefing: {
    forresterClass: 'forrester',
    gartnerClass: 'gartner',
    unknowClass: 'Unknown',
    firstClickTrueClass: 'firstClick_true',
    firstClickFalseClass: 'firstClick_false',
    unauthenticatedClass: 'Unauthenticated'
  },

  filterClientFields: [{
    id: 1,
    name: 'Active Status',
    value: 'status',
    options: [{
      name: 'Active',
      value: 1
    }, {
      name: 'Inactive',
      value: 2
    }],
    isOption: true,
    isTextbox: false
  },
  {
    id: 2,
    name: 'Client Partner',
    value: 'ClientPartner',
    options: [],
    isOption: true,
    isTextbox: false
  },
  {
    id: 3,
    name: 'Client Executive',
    value: 'ClientExecutive',
    options: [],
    isOption: true,
    isTextbox: false
  },
  {
    id: 4,
    name: 'Cohort',
    value: 'Cohort',
    options: [],
    isOption: true,
    isTextbox: false
  },
  {
    id: 5,
    name: 'Segmentation',
    value: 'Segmentation',
    options: [],
    isOption: true,
    isTextbox: false
  },
  {
    id: 6,
    name: 'Client Type',
    value: 'ClientType',
    options: [],
    isOption: true,
    isTextbox: false
  }
  ],

  filterAnalystFields: [
    {
      id: 1,
      name: 'Active Status',
      value: 'status',
      options: [{
        name: 'Active',
        value: 1
      }, {
        name: 'Inactive',
        value: 0
      }, {
        name: 'All',
        value: 2
      }],
      isOption: true,
      isTextbox: false
    }, {
      id: 2,
      name: 'Firm',
      value: 'Firm',
      options: [{
        name: 'All',
        value: 1
      }],
      isOption: true,
      isTextbox: false
    }, {
      id: 3,
      name: 'Research Type',
      value: 'ResearchType',
      options: [{
        name: 'All',
        value: 1
      }],
      isOption: true,
      isTextbox: false
    }, {
      id: 4,
      name: 'Ranking Report Author',
      value: 'RankingReportAuthor',
      options: [{
        name: 'All',
        value: 2
      }, {
        name: 'Yes',
        value: 1
      }, {
        name: 'No',
        value: 0
      }],
      isOption: true,
      isTextbox: false
    },
    {
      id: 5,
      name: 'Vendor Leaning',
      value: 'VendorLeaning',
      options: [{
        name: 'All',
        value: 1
      }],
      isOption: true,
      isTextbox: false
    }
  ],

  filterUserFields: [
    {
      id: 1,
      name: 'Active Status',
      value: 'status',
      options: [{
        name: 'Active',
        value: 1
      }, {
        name: 'Inactive',
        value: 0
      }, {
        name: 'All',
        value: 2
      }],
      isOption: true,
      isTextbox: false
    }
  ],

  placementSelect: [
    {
      name: 'Leader',
      value: '1'
    },
    {
      name: 'Niche Player',
      value: '2'
    },
    {
      name: 'Visionary',
      value: '3'
    },
    {
      name: 'Contender',
      value: '4'
    },
    {
      name: 'Strong Performer',
      value: '5'
    },
    {
      name: 'Challenger',
      value: '6'
    }
  ],

  programHealthList: [
    {
      value: 0,
      name: 'Green',
      class: 'ph-green-color'
    },
    {
      value: 1,
      name: 'Yellow',
      class: 'ph-yellow-color'
    },
    {
      value: 2,
      name: 'Red',
      class: 'ph-red-color'
    }
  ],
  //contant
  getStatusTabRankingReport: {
    CURRENT: 'current',
    FUTURE: 'future',
    PAST: 'past',
  },

  typeSaveObjective: {
    GLOBAL: 'global',
    CLIENT: 'client',
    CLIENT_CHANGE: 'client-change'
  },

  typeUploadImage: {
    AVATAR: 'avatar',
    ANALYST_AVATAR: 'analyst_avatar',
    CLIENT_AVATAR: 'client_avatar'
  },

  monthLabel: {
    MONTH_1: 'Jan',
    MONTH_2: 'Feb',
    MONTH_3: 'Mar',
    MONTH_4: 'Apr',
    MONTH_5: 'May',
    MONTH_6: 'Jun',
    MONTH_7: 'July',
    MONTH_8: 'Aug',
    MONTH_9: 'Sep',
    MONTH_10: 'Oct',
    MONTH_11: 'Nov',
    MONTH_12: 'Dec'
  },

  dayLabel: {
    DAY_1: 'Monday',
    DAY_2: 'Tuesday',
    DAY_3: 'Wednesday',
    DAY_4: 'Thursday',
    DAY_5: 'Friday',
    DAY_6: 'Saturday',
    DAY_7: 'Sunday',
  },

  fullMonthLabel: {
    MONTH_1: 'January',
    MONTH_2: 'February',
    MONTH_3: 'March',
    MONTH_4: 'April',
    MONTH_5: 'May',
    MONTH_6: 'June',
    MONTH_7: 'July',
    MONTH_8: 'August',
    MONTH_9: 'September',
    MONTH_10: 'October',
    MONTH_11: 'November',
    MONTH_12: 'December'
  },

  reportType: {
    QUARTER: 'quarter',
    MONTH: 'month'
  },

  quarter: {
    QUARTER_1: 'Q1',
    QUARTER_2: 'Q2',
    QUARTER_3: 'Q3',
    QUARTER_4: 'Q4',
  },

  outcomeTaskType: {
    SHOWCASE: 'Showcase',
    CITED: 'Cited',
    LEAD: 'Lead',
    PROMOTION: 'Promotion'
  },

  taskCoreStatus: {
    CORE: 'Core',
    NON_CORE: 'Non-core'
  },

  topic_ge: [
    {
      id: -1,
      color: "none",
      enabled: true,
      name: "-"
    }
  ],

  tableName: {
    analyst: 'ANALYST',
    client: 'CLIENT',
    report: 'REPORT',
    firm: 'FIRM',
    activity: 'ACTIVITY',
    insight: 'INSIGHT',
    event: 'EVENT',
    clientProfile: {
      event: 'CLIENT_EVENT',
      activity: 'CLIENT_ACTIVITY',
      insight: 'CLIENT_INSIGNT',
      report: 'CLIENT_REPORT',
      speaker: 'CLIENT_SPEAKER',
      health: 'CLIENT_HEALTH',
      analyst: 'CLIENT_ANALYST'
    },
    analystProfile: {
      event: 'ANALYST_EVENT',
      activity: 'ANALYST_ACTIVITY',
      insight: 'ANALYST_ACTIVITY',
    },
    reportProfile: {
      analyst: 'REPORT_ANALYST'
    },
    market: 'MARKET',
    collection: 'COLLECTION',
    marketProfile: {
      analyst: 'MARKET_ANALYST',
      event: 'MARKET_EVENT',
      research: 'MARKET_RESEARCH',
      insight: 'MARKET_INSIGHT',
    },
    collectionProfile: {
      analyst: 'COLLECTION_ANALYT',
      event: 'COLLECTION_EVENT',
      speaker: 'COLLECTION_SPEAKER',
      activity: 'COLLECTION_ACTIVITY'
    },
    researchProfile: {
      analyst: 'RESEARCH_ANALYST',
      event: 'RESEARCH_EVENT',
      report: 'RESEARCH_REPORT',
      insight: 'RESEARCH_INSIGHT'
    },
    eventProfile: {
      activity: 'EVENT_ACTIVITY',
      analyst: 'EVENT_ANALYST'
    },
    firmProfile: {
      analyst: 'FIRM_ANALYST',
      insight: 'FIRM_INSIGHT',
      client: 'FIRM_CLIENT',
      event: 'FIRM_EVENT',
      report: 'FIRM_REPORT'
    },
    admin: {
      user: 'ADMIN_USER',
    },
  },
  section: {
    ANALYST_DETAILS: 'Analyst Details',
    CATEGORIES: 'Categories',
    UPCOMING: 'Upcoming Activities',
    RECENT: 'Recent Activities',
    INFOR_GROUPS: 'Info Groups',
    INSIGHTS: 'Insights',
    OBJECTIVE: 'Objective',
    MARKET_DETAILS: 'Market Details',
    CLIENT_DETAILS: 'Client Details',
    ASSIGNED: 'Assigned',
    FIRM: 'Research Firm Subscription'
  },

  pageTemplate: {
    ANALYST_PROFILE: 'analyst_profile',
    CLIENT_PROFILE: 'client_profile',
    FIRM_PROFILE: 'firm_profile',
    REPORT_PROFILE: 'report_profile',
    RESEARCH: 'research',
    EVENT_PROFILE: 'event_profile',
    ACTIVITY_PROFILE: 'activity_profile',
    MARKET_PROFILE: 'market_profile',
    COLLECTION_PROFILE: 'collection_profile'
  },

  calendarType: {
    CLIENT_EVENT: 'client-event',
  },


  logType: {
    REF_ADD: 1,
    REF_DELETE: 2,
    UPDATE: 3,
  },


  objectTemplate: {
    ANALYST: '00000000-0000-0000-0000-000000000001',
    CLIENT: '00000000-0000-0000-0000-000000000003',
    CATEGORY: '00000000-0000-0000-0000-000000000002',
    EVENT: '00000000-0000-0000-0000-000000000004',
    ACTIVITY: '00000000-0000-0000-0000-000000000005',
    REPORT: '00000000-0000-0000-0000-000000000006',
    RESEARCH_FIRM: '00000000-0000-0000-0000-000000000007',
    SPEAKER: '00000000-0000-0000-0000-000000000008',
    MARKET: '00000000-0000-0000-0000-000000000010',
    ANALYST_CLIENT: '00000000-0000-0000-0000-000000000009',
    COLLECTION: '00000000-0000-0000-0000-000000000011',
  },

  clientHealth: [{
    id: 'ph-yellow-color',
    label: 'Yellow'
  }, {
    id: 'ph-red-color',
    label: 'Red'
  }, {
    id: 'ph-green-color',
    label: 'Green'
  }],

  reportStatus: [{
    id: 'Past',
    label: 'Past'
  }, {
    id: 'Current',
    label: 'Current'
  }, {
    id: 'Future',
    label: 'Future'
  }],

  clientStatus: [{
    id: 'Active',
    label: 'Active'
  }, {
    id: 'Inactive',
    label: 'Inactive'
  }],

  analystFirmSubscription: [{
    id: 'Forrester',
    label: 'Forrester'
  }, {
    id: 'Gartner ',
    label: 'Gartner '
  }, {
    id: 'Other',
    label: 'Other '
  }],

  maturitySegment: {
    id: '765936fc-6fa8-11e8-adc0-fa7ae01bbebc',
    subSegments: [
      {
        id: '2efe6084-6fa8-11e8-adc0-fa7ae01bbebc',
        name: 'Detractor'
      },
      {
        id: '43709870-6fa8-11e8-adc0-fa7ae01bbebc',
        name: 'Stranger'
      },
      {
        id: '4d300f4e-6fa8-11e8-adc0-fa7ae01bbebc',
        name: 'Acquaintance'
      },
      {
        id: '5c8e400a-6fa8-11e8-adc0-fa7ae01bbebc',
        name: 'Friendly'
      },
      {
        id: '662c6952-6fa8-11e8-aad9-fa7ae01bbebc',
        name: 'Advocate'
      }
    ]
  },

  noteType: [{
    id: '1',
    label: 'Prep Doc'
  }, {
    id: '2',
    label: 'Notes '
  }, {
    id: '3',
    label: 'AD Inquiry '
  }],

  insightType: [
    { value: 1, text: 'Feedback' },
    { value: 2, text: 'Intel' },
    { value: 3, text: 'Opportunity' },
    { value: 4, text: 'Outcome' },
    { value: 5, text: 'Analysis' },
    { value: 6, text: 'Summary' }
  ],

  insightTypeValue: {
    FEEDBACK: 1,
    INTEL: 2,
    OPPORTUNITY: 3,
    OUTCOME: 4,
    ANALYSIS: 5,
    SUMMARY: 6,
  },

  insightSensitivity: [
    { value: 1, text: 'Everyone' },
    // { value: 2, text: 'Spotlight Only' },
    // { value: 3, text: 'Subscription Limited' } => change to Everyone
    { value: 2, text: 'Confidential' }
  ],

  insightSensitivityValue: {
    EVERYONE: 1,
    CONFIDENTIAL: 2,
  },

  dataDefaultPrepNote: '<p>Topic</p> <p></p> <p>Why is this important? </p> <p></p> <p>How do we win?</p> <p></p> <p>Good to know </p>',

  activityType: {
    CORE: 'Core'
  },

  activityGroupItems: {
    DEBRIEF: 'Debrief'
  },

  activityKind: {
    STANDARD: 'Standard',
    OUTCOME: 'Outcome',
    OUTCOME_REPORT: 'Outcome Report'
  },

  globalSegment: {
    CORE_OPPORTUNISTIC: 'Core & Opportunistic',
    OPPORTUNISTIC: 'Opportunistic',
    CORE: 'Core'
  },

  clientType: {
    CITED: 0,
    SHOWCASE: 1
  },

  insightObjectType: {
    Analyst: 'Analyst',
    Analysts: 'Analysts',
    Client: 'Client',
    Clients: 'Clients',
    Event: 'Event',
    Activity: 'Activity',
    Report: 'Report',
    Category: 'Category',
    Categories: 'Categories',
    Firm: 'Firm',
    Collection: 'Collection'
  },

  formatColorCalendar: {
    COLOR_F9E795: '#F9E795',
    COLOR_F25252: '#FF7D7D',
    COLOR_7283F2: '#95CBFC',
    COLOR_7FFA84: '#95FCA5',
    COLOR_3D4054: '#3D4054'
  },

  CheckPermissionRoutes: {
    'client-overview': {
      'keyField': 'clientId',
      'type': 'Client',
      'restrict': false
    },
    'event-overview': {
      'keyField': 'eventId',
      'type': 'Event',
      'restrict': true
    },
    'report-overview': {
      'keyField': 'reportId',
      'type': 'Report',
      'restrict': false
    },
    'activity-overview': {
      'keyField': 'activityId',
      'type': 'Activity',
      'restrict': false
    },
    'analyst-overview': {
      'keyField': 'analystId',
      'type': 'Analyst',
      'restrict': false
    },
    'collection-overview': {
      'keyField': 'collectionId',
      'type': 'Collection',
      'restrict': false
    },
    'research-overview': {
      'keyField': 'researchId',
      'type': 'Category',
      'restrict': true
    },
    'market-overview': {
      'keyField': 'marketId',
      'type': 'Market',
      'restrict': true
    },
    'firm-overview': {
      'keyField': 'firmId',
      'type': 'Firm',
      'restrict': true
    }
  },

  sentimentFilterArray: [
    { label: "Positive", value: 5 },
    { label: "Somewhat Positive", value: 4 },
    { label: "Neutral", value: 3 },
    { label: "Somewhat Cautionary", value: 2 },
    { label: "Cautionary", value: 1 }
  ]
};

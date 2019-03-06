const Gelf = require('gelf');
const logLevel = {
  emergency: 0,
  alert: 1,
  critical: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7
};
const changeToHumanReadMessage = (message, grayLogOptions) => {
  message.host = grayLogOptions.hostName ? grayLogOptions.hostName : '';
  message.facility = grayLogOptions.facility ? grayLogOptions.facility : '';
  let humanReadMessage = 'At ' + message.timestamp + ', user ' + message.user + ' ' + message.action + ' with url request: ' + message.originalUrl + ' finished in ' + message.elapsedInMs + ' milliseconds wih status ' + message.statusCode;
  if (message.errorMessage) {
    humanReadMessage += ' with error message ' + message.errorMessage;
  }
  message.short_message = humanReadMessage;
  return message;
};

exports = module.exports = {
  getLogger: (options) => {
    options = options || {};
    let grayLogOptions = options.grayLogOptions || {};
    const gelf = new Gelf({
      graylogPort: grayLogOptions.port ? grayLogOptions.port : 12201,
      graylogHostname: grayLogOptions.server ? grayLogOptions.server : '127.0.0.1',
    });
    gelf.info = (message) => {
      message.level = logLevel.info;
      message = changeToHumanReadMessage(message, grayLogOptions);
      gelf.emit('gelf.log', message);
    };
    gelf.error = (message) => {
      message.level = logLevel.error;
      changeToHumanReadMessage(message, grayLogOptions);
      gelf.emit('gelf.log', message);
    };
    return gelf;
  },

};

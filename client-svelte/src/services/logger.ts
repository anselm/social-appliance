import log from 'loglevel'

// Configure log levels for different modules
const loggers = {
  apiClient: log.getLogger('apiClient'),
  dataLoader: log.getLogger('dataLoader'),
  database: log.getLogger('database'),
  api: log.getLogger('api')
}

// Set default log level to WARN (silences info and debug)
// Available levels: TRACE, DEBUG, INFO, WARN, ERROR, SILENT
Object.values(loggers).forEach(logger => {
  logger.setLevel('warn')
})

// You can override individual loggers like this:
// loggers.apiClient.setLevel('debug')
// loggers.dataLoader.setLevel('info')

export default loggers

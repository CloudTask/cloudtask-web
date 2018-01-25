let getConfig = () => {
  let env = process.env.HUMPBACK_ENV || 'gdev';
  let configInfo = {
    version: '1.0.0',
    isDebugMode: true,
    listenPort: process.env.HUMPBACK_LISTEN_PORT || 8100,
    dbConfigs: {
      locationCollection: { name: 'sys_locations' },
      jobCollection: { name: 'sys_jobs' },
      userCollection: { name: 'sys_users' },
      logCollection: { name: 'LogInfo', ttl: 30 * 24 * 60 * 60 },
      sessionCollection: { name: 'SessionInfo', ignoreLoad: true },
      activityCollection: { name: 'sys_activitys' },
      logCollection: { name: 'sys_logs' }
    },
    encryptKey: 'cloudtask@123'
  };
  return configInfo;
}

module.exports = getConfig();

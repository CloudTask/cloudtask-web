let getConfig = () => {
  let env = process.env.HUMPBACK_ENV || 'gdev';
  let configInfo = {
    version: '1.0.0',
    isDebugMode: true,
    listenPort: process.env.HUMPBACK_LISTEN_PORT || 8100,
    dbConfigs: {
      runtimeCollection: { name: 'RuntimeInfo' },
      jobCollection: { name: 'JobInfo' },
      userCollection: { name: 'UserInfo' },
      logCollection: { name: 'LogInfo', ttl: 30 * 24 * 60 * 60 },
      sessionCollection: { name: 'SessionInfo', ignoreLoad: true },
      systemConfigCollection: { name: 'ActivityInfo' },
      dashboardCollection: { name: 'Dashboard' }
    },
    encryptKey: 'cloudtask@123'
  };
  return configInfo;
}

module.exports = getConfig();

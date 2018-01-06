const jobstatus = {
  STATE_REALLOC    : 202, //重新分配
	STATE_CREATED    : 201, //初始创建
	STATE_STARTED    : 200, //成功状态
	STATE_STOPED     : 0,   //停止状态
	STATE_FAILED     : -1,  //失败状态
}

exports.jobstatus = jobstatus;

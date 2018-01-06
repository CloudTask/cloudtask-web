const requestResultCode = {
  RequestSuccessed    : 0,
	RequestInvaild      : -1000,
	RequestNotFound     : -1001,
	RequestConflict     : -1003,
	RequestException    : -1004,
	RequestStateInvalid : -1005,
	RequestJobNotAlloc  : -1006,
}

const requestResultErr = {
  ErrRequestSuccessed    : "request successed.",
	ErrRequestInvaild      : "request resolve invaild.",
	ErrRequestNotFound     : "request resource not found.",
	ErrRequestConflict     : "request resource conflict.",
	ErrRequestException    : "request server exception.",
	ErrRequestStateInvalid : "request state invalid.",
	ErrRequestJobNotAlloc  : "request action job not alloc, can not run.",
}

exports.requestResultCode = requestResultCode;
exports.requestResultErr = requestResultErr;

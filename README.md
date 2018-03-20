# Introduction

作为 [Cloudtask](https://humpback.github.io/humpback) 的直观展现，基于 [Angular2](https://github.com/angular/angular) 和 [AdminLTE](https://github.com/almasaeed2010/AdminLTE) 构建的用于管理 `job ` 的网站。

# Usage
```bash
git clone https://github.com/CloudTask/cloudtask-web.git
cd cloudtask-web
npm install
npm start
```
Open [http://localhost:8091](http://localhost:8091)

Default Account    
>UserID: `admin`   
Password: `123456`    

# Docker image
[![](https://images.microbadger.com/badges/image/humpbacks/humpback-web:1.0.1.svg)](https://microbadger.com/images/humpbacks/humpback-web:1.0.1 "Get your own image badge on microbadger.com")
[![](https://images.microbadger.com/badges/version/humpbacks/humpback-web:1.0.1.svg)](https://microbadger.com/images/humpbacks/humpback-web:1.0.1 "Get your own version badge on microbadger.com")
```bash
$ docker pull humpbacks/humpback-web:1.0.1

$ docker run -d --net=host --restart=always -e HUMPBACK_LISTEN_PORT=8012 \
  -v /opt/app/humpback-web/dbFiles:/humpback-web/dbFiles \
  --name humpback-web \
  humpbacks/humpback-web:1.0.1
```

# Functions
- 任务分组管理
- 分组及运行时管理
- 任务实时监控
- 任务输出日志查看
- 任务分配信息查看
- etc.

# Sample Page
#### Login Page
![image](https://github.com/CloudTask/cloudtask-web/blob/master/screenshots/login.png)

#### Job List
![image](https://github.com/CloudTask/cloudtask-web/blob/master/screenshots/joblist.png)

#### New Job
![image](https://github.com/CloudTask/cloudtask-web/blob/master/screenshots/newjob.png)

#### Runtime - server info
![image](https://github.com/CloudTask/cloudtask-web/blob/master/screenshots/serverinfo.png)
etc.

#### The assign table of jobs in current runtime
![image](https://github.com/CloudTask/cloudtask-web/blob/master/screenshots/assignTable.png)

#### The system config
![image](https://github.com/CloudTask/cloudtask-web/blob/master/screenshots/sysconfig.png)
etc.

## License

Apache-2.0

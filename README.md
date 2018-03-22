# Cloudtask Web Introduction

This project is an [cloudtask](https://cloudtask.github.io/cloudtask) website management system, through it can more intuitive operation of various management features. based on [Angular2](https://github.com/angular/angular) and [AdminLTE](https://github.com/almasaeed2010/AdminLTE) build.

### Usage
```bash
git clone https://github.com/cloudTask/cloudtask-web.git
cd cloudtask-web
npm install
gulp dev
```
### Build
```bash
git clone https://github.com/cloudTask/cloudtask-web.git
cd cloudtask-web
npm install
npm run build
```

Open [http://localhost:8091](http://localhost:8091)

Default `Administrator` Account    
> UserID: `admin`   
> Password: `123456`    

### Docker image
[![](https://images.microbadger.com/badges/image/cloudtask/cloudtask-web:2.0.0.svg)](https://microbadger.com/images/cloudtask/cloudtask-web:2.0.0 "Get your own image badge on microbadger.com")
[![](https://images.microbadger.com/badges/version/cloudtask/cloudtask-web:2.0.0.svg)](https://microbadger.com/images/cloudtask/cloudtask-web:2.0.0 "Get your own version badge on microbadger.com")
```bash
$ docker pull cloudtask/cloudtask-web:2.0.0

$ docker run -d --net=host --restart=always \
  -v /opt/app/cloudtask-web/config.js:/cloudtask-web/common/config.js \
  -v /opt/app/cloudtask-web/uploads:/cloudtask-web/uploads \
  -v /etc/localtime:/etc/localtime \
  --name=cloudtask-web \
  cloudtask\cloudtask-web:2.0.0
```

# Features
- System dashboard, intuitive display of various data.
- Task groups manage, all tasks can be managed by business grouping.
- Runtime and servers manage, can add a runtime and join the worker servers.
- Task jobs manage and view the status and logs of tasks by group.
- Browse cloudtask scheduler status.
- Quick search by task name or id.
- Account rights management. 

# Sample Page
#### Login Page
![image](https://github.com/cloudTask/cloudtask-web/blob/master/screenshots/login.png)

#### Job List
![image](https://github.com/cloudTask/cloudtask-web/blob/master/screenshots/joblist.png)

#### New Job
![image](https://github.com/cloudTask/cloudtask-web/blob/master/screenshots/newjob.png)

#### Runtime - server info
![image](https://github.com/cloudTask/cloudtask-web/blob/master/screenshots/serverinfo.png)
etc.

#### The assign table of jobs in current runtime
![image](https://github.com/cloudTask/cloudtask-web/blob/master/screenshots/assignTable.png)

#### The system config
![image](https://github.com/cloudTask/cloudtask-web/blob/master/screenshots/sysconfig.png)
etc.

## License
cloudtask source code is licensed under the [Apache Licence 2.0](http://www.apache.org/licenses/LICENSE-2.0.html). 

import { Component, ViewChild, Output, ElementRef, EventEmitter, Input, forwardRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService, LocationService } from './../../services';

declare let Config: any;
declare let messager: any;

@Component({
  selector: 'ct-import-job',
  templateUrl: './import-job.html',
  styleUrls: ['/import-job.css']
})

export class ImportJobComponent {
  @Input()
  private options: any = {};
  private services: Array<any>;
  private selectedServer: any = '';
  private filterCondition: any;
  private selectJobs: Array<any>;
  private filterJobs: Array<any> = [];
  private searchTimeout: any;
  private selectJobIndex: any;
  private importJobId: any;
  private location: any;
  private groupId: any;

  private subscriber: any;

  @Output()
  private selectedImportJob: EventEmitter<any> = new EventEmitter();

  constructor(
    private _jobService: JobService,
    private _locationService: LocationService,
    private _route: ActivatedRoute,
    private _router: Router) {

}

  ngOnInit() {
    this.subscriber = this._route.params.subscribe(params => {
      this.location = params['location'];
      this.groupId = params['groupId'];
    });
    this._locationService.getJobconsoleServer()
      .then(res => this.services = res)
      .catch(err => {
        messager.error(err.message || "Get services failed");
        this._router.navigate(['task', this.location, this.groupId, 'overview']);
      })
  }

  private selectedServerChange(value: any) {
    this._jobService.getJobconsole(value)
      .then(res => {
        this.selectJobs = res;
        this.search();
      })
      .catch(err => {
        messager.error(err.message || "Get jobs failed");
      })
  }

  private search(value?: any) {
    this.filterCondition = value || '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      let keyWord = this.filterCondition;
      if (!keyWord) {
        this.filterJobs = this.selectJobs;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterJobs = this.selectJobs.filter((item: any) => {
          return regex.test(item.JobName);
        });
      }
    }, 100);
  }

  private selectJob(index: any, id: any) {
    this.selectJobIndex = index;
    this.importJobId = id;
  }

  private confirmImport() {
    this._jobService.importJob(this.importJobId)
      .then((job: any) => {
        job.location = this.location;
        job.groupid = this.groupId;
        this.selectedImportJob.emit(job);
        this.options.show = false;
      })
      .catch(err => {
        messager.error(err.message || "Import job failed");
        this._router.navigate(['task', this.location, this.groupId, 'overview']);
      })
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
}

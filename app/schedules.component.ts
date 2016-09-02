import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {IOTService} from "./IOT.service";
import {Schedule} from "./schedule";
declare var $:any;

@Component({
    selector: 'schedules',
    templateUrl: 'app/schedules.component.html',
    providers: [IOTService],
})

export class SchedulesComponent implements OnInit {
    loaded:boolean = false;
    @Input() token:string;
    errorMessage:string;
    schedules:Schedule[];
    model:Schedule = new Schedule({});

    constructor (private iotService: IOTService) { }

    ngOnInit() {
        this.getSchedules();
        $('[data-toggle="tooltip"]').tooltip();
        $('.selectpicker').selectpicker({
            size: 4
        });
    }

    getSchedules() {
        this.iotService.getSchedules(this.token)
            .subscribe(
                schedules => {
                    this.schedules = schedules.map(schedule => new Schedule(schedule));
                    this.isLoaded();
                },
                error =>  this.errorMessage = <any>error);
    }

    isLoaded() {
        this.loaded = true;
        this.eventLoaded.emit("schedules");
        console.log(this.schedules);
    }

    add() {
        this.model = new Schedule({});
    }

    mod(schedule){
        this.model.copyFrom(schedule);
    }

    addOrUpdate() {
        console.log(this.model.id);
        var schedule = this.model.toSchedule();
        if (this.model.id == null){
            this.iotService.addSchedule(this.token, schedule)
                .subscribe(object => this.updateScheduleInfo(schedule, object));

            console.log(schedule);
        }
        else{
            this.iotService.updateSchedule(this.token, schedule)
                .subscribe(() => this.findAndUpdate(schedule));
        }
    }

    delete(){
        this.iotService.deleteSchedule(this.token, this.model.id)
            .subscribe(() => this.findAndDelete(this.model.id));
    }

    updateScheduleInfo(schedule, object) {
        console.log("updating");
        schedule.id = object.id;
        this.schedules.push(this.model);
    }

    findAndUpdate(schedule){
        for (var i = 0; i < this.schedules.length; i++) {
            if (this.schedules[i].id == schedule.id)
                this.schedules[i] = schedule;
        }
    }

    findAndDelete(id){
        for (var i = 0; i < this.schedules.length; i++) {
            if (this.schedules[i].id == id)
                this.schedules.splice(i, 1);
        }
    }


    @Output() eventLoaded = new EventEmitter();
}
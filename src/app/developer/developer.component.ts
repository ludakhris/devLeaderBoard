import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Developer } from './developer';
import { DeveloperService } from '../developer.service';

@Component({
  selector: 'app-developer',
  templateUrl: './developer.component.html',
  styleUrls: ['./developer.component.css']
})

export class DeveloperComponent implements OnInit {

  developers: Developer[];

  constructor(private devService: DeveloperService, private router: Router) { }

  ngOnInit() {
    this.getDevs();
  }

  getDevs(): void {
    this.devService.getDevs()
      .subscribe(devs => this.developers = devs);
  }

  addNew(): void {
    this.devService.addDev(
      { name: 'New Developer' } as Developer)
      .subscribe(dev => {
        this.developers.push(dev);
        this.router.navigate(['/detail', dev.id]);
      });
  }

  delete(dev: Developer): void {
    this.developers = this.developers.filter(d => d !== dev);
    this.devService.deleteDev(dev).subscribe();
  }
}

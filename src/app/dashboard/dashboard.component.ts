import { Component, OnInit } from '@angular/core';
import { Developer } from '../developer/developer';
import { DeveloperService } from '../developer.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {
  developers: Developer[] = [];

  constructor(private devService: DeveloperService) { }

  ngOnInit() {
    this.getHeroes();
  }

  getHeroes(): void {
    this.devService.getDevs()
      .subscribe(devs => this.developers = devs.slice(1, 5));
  }
}

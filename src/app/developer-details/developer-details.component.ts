import { Component, OnInit, Input } from '@angular/core';
import { Developer } from '../developer/developer';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DeveloperService } from '../developer.service';

@Component({
  selector: 'app-developer-details',
  templateUrl: './developer-details.component.html',
  styleUrls: ['./developer-details.component.css']
})
export class DeveloperDetailsComponent implements OnInit {

  @Input() dev: Developer;

  constructor(
    private route: ActivatedRoute,
    private devService: DeveloperService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getDev();
  }

  getDev(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.devService.getDev(id)
      .subscribe(d => this.dev = d);
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    this.devService.updateDev(this.dev)
      .subscribe(() => this.goBack());
  }
}

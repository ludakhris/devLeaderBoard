import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { Developer } from '../developer/developer';
import { DeveloperService } from '../developer.service';

@Component({
  selector: 'app-dev-search',
  templateUrl: './dev-search.component.html',
  styleUrls: ['./dev-search.component.css']
})

export class DevSearchComponent implements OnInit {

  developers$: Observable<Developer[]>;
  private searchTerms = new Subject<string>();

  constructor(private devService: DeveloperService) {}

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.developers$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.devService.searchDevs(term)),
    );
  }

}

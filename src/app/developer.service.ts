import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { Developer } from './developer/developer';
import { MessageService } from './message.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class DeveloperService {

  private devUrl = 'api/devs';  // URL to web api

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  getDevs(): Observable<Developer[]> {
    return this.http.get<Developer[]>(this.devUrl)
      .pipe(
        tap(devs => this.log(`Data Refresh Complete...`)),
        catchError(this.handleError('getDevs', []))
      );
  }

  getDev(id: number): Observable<Developer> {
    const url = `${this.devUrl}/${id}`;
    return this.http.get<Developer>(url)
      .pipe(
        tap(_ => this.log(`Developer id=${id} fetched.`)),
        catchError(this.handleError<Developer>(`getDev id=${id}`))
      );
  }

  /** PUT: update the hero on the server */
  updateDev (dev: Developer): Observable<any> {
    return this.http.put(this.devUrl, dev, httpOptions).pipe(
      tap(_ => this.log(`Updated dev id=${dev.id}`)),
      catchError(this.handleError<any>('updateDev'))
    );
  }

  /** POST: add a new hero to the server */
  addDev (dev: Developer): Observable<Developer> {
    return this.http.post<Developer>(this.devUrl, dev, httpOptions)
      .pipe(
        tap((d: Developer) => this.log(`Added dev w/ id=${d.id}`)),
        catchError(this.handleError<Developer>('addDev'))
      );
  }

  /** DELETE: delete the hero from the server */
  deleteDev (dev: Developer | number): Observable<Developer> {
    const id = typeof dev === 'number' ? dev : dev.id;
    const url = `${this.devUrl}/${id}`;

    return this.http.delete<Developer>(url, httpOptions).pipe(
      tap(_ => this.log(`Deleted dev id=${id}`)),
      catchError(this.handleError<Developer>('deleteDev'))
    );
  }

  /* GET heroes whose name contains search term */
  searchDevs(term: string): Observable<Developer[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }

    const url = `${this.devUrl}/?name=${term}`;
    return this.http.get<Developer[]>(url)
      .pipe(
        tap(_ => this.log(`found devs matching "${term}"`)),
        catchError(this.handleError<Developer[]>('searchDevs', []))
     );
  }

  /** Log a DevService message with the MessageService */
  private log(message: string) {
    this.messageService.add('DevService: ' + message);
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error);

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}

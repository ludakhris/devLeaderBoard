import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperDetailsComponent } from './developer-details.component';

describe('DeveloperDetailsComponent', () => {
  let component: DeveloperDetailsComponent;
  let fixture: ComponentFixture<DeveloperDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeveloperDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeveloperDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

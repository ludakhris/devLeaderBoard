import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevSearchComponent } from './dev-search.component';

describe('DevSearchComponent', () => {
  let component: DevSearchComponent;
  let fixture: ComponentFixture<DevSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

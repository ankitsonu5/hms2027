import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessionSettings } from './accession-settings';

describe('AccessionSettings', () => {
  let component: AccessionSettings;
  let fixture: ComponentFixture<AccessionSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessionSettings],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessionSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

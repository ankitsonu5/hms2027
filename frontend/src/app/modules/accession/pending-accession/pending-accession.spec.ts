import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingAccession } from './pending-accession';

describe('PendingAccession', () => {
  let component: PendingAccession;
  let fixture: ComponentFixture<PendingAccession>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingAccession],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingAccession);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Accessed } from './accessed';

describe('Accessed', () => {
  let component: Accessed;
  let fixture: ComponentFixture<Accessed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accessed],
    }).compileComponents();

    fixture = TestBed.createComponent(Accessed);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

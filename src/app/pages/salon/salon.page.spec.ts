import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalonPage } from './salon.page';

describe('SalonPage', () => {
  let component: SalonPage;
  let fixture: ComponentFixture<SalonPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SalonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

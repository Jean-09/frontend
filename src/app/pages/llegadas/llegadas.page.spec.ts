import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LlegadasPage } from './llegadas.page';

describe('LlegadasPage', () => {
  let component: LlegadasPage;
  let fixture: ComponentFixture<LlegadasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LlegadasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

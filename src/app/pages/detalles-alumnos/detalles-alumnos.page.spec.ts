import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesAlumnosPage } from './detalles-alumnos.page';

describe('DetallesAlumnosPage', () => {
  let component: DetallesAlumnosPage;
  let fixture: ComponentFixture<DetallesAlumnosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesAlumnosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

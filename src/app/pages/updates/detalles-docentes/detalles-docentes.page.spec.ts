import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesDocentesPage } from './detalles-docentes.page';

describe('DetallesDocentesPage', () => {
  let component: DetallesDocentesPage;
  let fixture: ComponentFixture<DetallesDocentesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesDocentesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

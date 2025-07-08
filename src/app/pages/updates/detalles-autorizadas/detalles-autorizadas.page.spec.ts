import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesAutorizadasPage } from './detalles-autorizadas.page';

describe('DetallesAutorizadasPage', () => {
  let component: DetallesAutorizadasPage;
  let fixture: ComponentFixture<DetallesAutorizadasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesAutorizadasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

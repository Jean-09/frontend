import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesSalonPage } from './detalles-salon.page';

describe('DetallesSalonPage', () => {
  let component: DetallesSalonPage;
  let fixture: ComponentFixture<DetallesSalonPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesSalonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

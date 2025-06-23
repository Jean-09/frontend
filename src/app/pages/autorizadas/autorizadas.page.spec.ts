import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutorizadasPage } from './autorizadas.page';

describe('AutorizadasPage', () => {
  let component: AutorizadasPage;
  let fixture: ComponentFixture<AutorizadasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AutorizadasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

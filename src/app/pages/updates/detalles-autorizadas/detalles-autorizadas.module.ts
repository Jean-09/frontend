import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesAutorizadasPageRoutingModule } from './detalles-autorizadas-routing.module';

import { DetallesAutorizadasPage } from './detalles-autorizadas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesAutorizadasPageRoutingModule
  ],
  declarations: [DetallesAutorizadasPage]
})
export class DetallesAutorizadasPageModule {}

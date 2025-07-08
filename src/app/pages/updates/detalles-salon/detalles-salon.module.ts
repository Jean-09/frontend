import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesSalonPageRoutingModule } from './detalles-salon-routing.module';

import { DetallesSalonPage } from './detalles-salon.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesSalonPageRoutingModule
  ],
  declarations: [DetallesSalonPage]
})
export class DetallesSalonPageModule {}

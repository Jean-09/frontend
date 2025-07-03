import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesAlumnosPageRoutingModule } from './detalles-alumnos-routing.module';

import { DetallesAlumnosPage } from './detalles-alumnos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesAlumnosPageRoutingModule
  ],
  declarations: [DetallesAlumnosPage]
})
export class DetallesAlumnosPageModule {}

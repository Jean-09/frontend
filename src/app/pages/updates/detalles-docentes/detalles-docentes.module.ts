import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesDocentesPageRoutingModule } from './detalles-docentes-routing.module';

import { DetallesDocentesPage } from './detalles-docentes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesDocentesPageRoutingModule
  ],
  declarations: [DetallesDocentesPage]
})
export class DetallesDocentesPageModule {}

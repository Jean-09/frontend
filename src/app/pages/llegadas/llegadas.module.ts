import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LlegadasPageRoutingModule } from './llegadas-routing.module';

import { LlegadasPage } from './llegadas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LlegadasPageRoutingModule
  ],
  declarations: [LlegadasPage]
})
export class LlegadasPageModule {}

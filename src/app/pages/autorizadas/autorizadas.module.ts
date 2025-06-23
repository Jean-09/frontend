import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AutorizadasPageRoutingModule } from './autorizadas-routing.module';

import { AutorizadasPage } from './autorizadas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AutorizadasPageRoutingModule
  ],
  declarations: [AutorizadasPage]
})
export class AutorizadasPageModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesSalonPage } from './detalles-salon.page';

const routes: Routes = [
  {
    path: '',
    component: DetallesSalonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesSalonPageRoutingModule {}

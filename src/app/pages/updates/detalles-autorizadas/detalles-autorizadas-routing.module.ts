import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesAutorizadasPage } from './detalles-autorizadas.page';

const routes: Routes = [
  {
    path: '',
    component: DetallesAutorizadasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesAutorizadasPageRoutingModule {}

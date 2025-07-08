import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesDocentesPage } from './detalles-docentes.page';

const routes: Routes = [
  {
    path: '',
    component: DetallesDocentesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesDocentesPageRoutingModule {}

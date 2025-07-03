import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesAlumnosPage } from './detalles-alumnos.page';

const routes: Routes = [
  {
    path: '',
    component: DetallesAlumnosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesAlumnosPageRoutingModule {}

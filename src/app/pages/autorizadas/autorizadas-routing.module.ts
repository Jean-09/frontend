import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AutorizadasPage } from './autorizadas.page';

const routes: Routes = [
  {
    path: '',
    component: AutorizadasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AutorizadasPageRoutingModule {}

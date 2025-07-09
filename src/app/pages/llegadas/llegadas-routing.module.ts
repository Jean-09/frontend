import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LlegadasPage } from './llegadas.page';

const routes: Routes = [
  {
    path: '',
    component: LlegadasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LlegadasPageRoutingModule {}

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'alumnos',
    loadChildren: () => import('./pages/alumnos/alumnos.module').then( m => m.AlumnosPageModule)
  },
  {
    path: 'docente',
    loadChildren: () => import('./pages/docente/docente.module').then( m => m.DocentePageModule)
  },
  {
    path: 'autorizadas',
    loadChildren: () => import('./pages/autorizadas/autorizadas.module').then( m => m.AutorizadasPageModule)
  },
  {
    path: 'salon',
    loadChildren: () => import('./pages/salon/salon.module').then( m => m.SalonPageModule)
  },
  {
    path: 'detalles-alumnos',
    loadChildren: () => import('./pages/detalles-alumnos/detalles-alumnos.module').then( m => m.DetallesAlumnosPageModule)
  },  {
    path: 'detalles-autorizadas',
    loadChildren: () => import('./pages/updates/detalles-autorizadas/detalles-autorizadas.module').then( m => m.DetallesAutorizadasPageModule)
  },
  {
    path: 'detalles-docentes',
    loadChildren: () => import('./pages/updates/detalles-docentes/detalles-docentes.module').then( m => m.DetallesDocentesPageModule)
  },
  {
    path: 'detalles-salon',
    loadChildren: () => import('./pages/updates/detalles-salon/detalles-salon.module').then( m => m.DetallesSalonPageModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./pages/user/user.module').then( m => m.UserPageModule)
  },
  {
    path: 'llegadas',
    loadChildren: () => import('./pages/llegadas/llegadas.module').then( m => m.LlegadasPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

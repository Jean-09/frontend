import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-autorizadas',
  templateUrl: './autorizadas.page.html',
  styleUrls: ['./autorizadas.page.scss'],
  standalone: false
})
export class AutorizadasPage implements OnInit {

  constructor(private api: ApiService, private storage: Storage, private route: Router) { }

  async ngOnInit() {
    await this.storage.create();
    await this.getToken();
    await this.getAutorizadas();

  }

  autorizadas: any[] = [];
  token = '';

  async getToken() {
    this.token = await this.storage.get('token');
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }

  getAutorizadas() {
    this.api.getAut(this.token).then((res) => {
        this.autorizadas = res;
        console.log(this.autorizadas);
      }).catch((error)=>{

        console.log(error);

      })

  }

  borrar(id:any){

  }

  update(){

  }

       toggleStatus(a: any) {
    const nuevoEstado = !a.estatus;

    this.api.delAut(a, nuevoEstado, this.token).then((res) => {
      console.log('Estado cambiado:', res);
      a.estatus = nuevoEstado;
      this.getAutorizadas();
    }).catch((error) => {
      console.error('Error al cambiar estado:', error);
    });
  }

    async logout() {
    await this.storage.remove('token');
    this.route.navigate(['/login']);
  }
}



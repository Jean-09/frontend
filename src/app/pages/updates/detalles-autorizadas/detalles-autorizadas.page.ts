import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-detalles-autorizadas',
  templateUrl: './detalles-autorizadas.page.html',
  styleUrls: ['./detalles-autorizadas.page.scss'],
  standalone: false
})
export class DetallesAutorizadasPage implements OnInit {

  constructor() { }

  async ngOnInit() {
    await this.getAut();
  }

  autorizada:any;

  getAut(){
    this.autorizada = history.state.autorizada
    console.log(this.autorizada)
  }
}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-detalles-docentes',
  templateUrl: './detalles-docentes.page.html',
  styleUrls: ['./detalles-docentes.page.scss'],
  standalone: false
})
export class DetallesDocentesPage implements OnInit {

  constructor() { }

  async ngOnInit() {
    await this.getDoce();
  }

  docente:any;

  getDoce(){
    this.docente = history.state.docente
    console.log(this.docente)
  }
}

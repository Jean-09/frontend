import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-detalles-alumnos',
  templateUrl: './detalles-alumnos.page.html',
  styleUrls: ['./detalles-alumnos.page.scss'],
  standalone: false
})
export class DetallesAlumnosPage implements OnInit {

  constructor() { }

  async ngOnInit() {
    await this.getAlumno();
  }

  alumno:any;

  getAlumno(){
    this.alumno = history.state.alumno
    console.log(this.alumno)
  }

}

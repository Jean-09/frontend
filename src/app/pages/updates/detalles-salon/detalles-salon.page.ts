import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-detalles-salon',
  templateUrl: './detalles-salon.page.html',
  styleUrls: ['./detalles-salon.page.scss'],
  standalone: false
})
export class DetallesSalonPage implements OnInit {

  constructor() { }

  async ngOnInit() {
    await this.getSalon();
  }

  salon:any;

  getSalon(){
    this.salon = history.state.salon
    console.log(this.salon)
  }
}

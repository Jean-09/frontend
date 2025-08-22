import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData,  } from 'chart.js';
import { ApiService } from 'src/app/service/api.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  // ... (Tus propiedades existentes)
  totalAlumnos: number = 0;
  totalDocentes: number = 0;
  totalLlegadasHoy: number = 0;
  public alumnosEstado: any[] = [];
  public llegadasRecientes: any[] = [];
  token = '';

  constructor(
    private api: ApiService,
    private storage: Storage,
    private route: Router
  ) { }

  async ngOnInit() {
    await this.storage.create();
    await this.getToken();
    if (this.token) {
      this.cargarDatosDashboard();
    }
  }

  async getToken() {
    this.token = await this.storage.get('token');
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }

  async cargarDatosDashboard() {
    // ... (Tu lógica para cargar los datos de la API)

    const alumnos = await this.api.getAllAlum(this.token);
    this.totalAlumnos = alumnos.length;

    const docentes = await this.api.getAllDoce(this.token);
    this.totalDocentes = docentes.length;

    const llegadas = await this.api.getAllLlegadas(this.token);

    const hoy = new Date().toISOString().slice(0, 10);
    this.totalLlegadasHoy = llegadas.filter((l: any) => l.horaLlegada?.slice(0, 10) === hoy).length;

    this.llegadasRecientes = llegadas
      .filter((l: any) => l)
      .map((l: any) => ({
        alumno: l.alumno?.data?.nombre || 'N/A',
        docente: l.docente?.data?.nombre || 'N/A',
        horaLlegada: l.horaLlegada
      }))
      .slice(0, 10);

    this.alumnosEstado = alumnos
      .filter((a: any) => a)
      .map((a: any) => ({
        nombre: a.nombre,
        estatus: a.estatus ? 'Activo' : 'Inactivo',
        salon: a.salon?.data?.nombre || 'Sin Salón'
      }));
  }

  // **NUEVO MÉTODO:** Exportar datos a CSV
  exportarDatosCSV(data: any[], filename: string) {
    if (data.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    // Obtener los encabezados de las columnas del primer objeto
    const headers = Object.keys(data[0]).join(',');
    
    // Convertir los datos a formato CSV
    const csvContent = data.map(row => Object.values(row).join(',')).join('\n');
    const fullCsv = `${headers}\n${csvContent}`;

    // Crear un blob y un enlace de descarga
    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Llamar al método de exportación para la tabla de alumnos
  exportarAlumnosAExcel() {
    this.exportarDatosCSV(this.alumnosEstado, 'estado_alumnos.csv');
  }

  // Llamar al método de exportación para la tabla de llegadas
  exportarLlegadasAExcel() {
    this.exportarDatosCSV(this.llegadasRecientes, 'llegadas_recientes.csv');
  }
}

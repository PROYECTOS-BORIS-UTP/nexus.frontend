import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { DateAdapter, provideCalendar, CalendarPreviousViewDirective, CalendarTodayDirective, CalendarNextViewDirective, CalendarMonthViewComponent, CalendarWeekViewComponent, CalendarDayViewComponent, CalendarEvent, CalendarView, CalendarDatePipe } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@Component({
	selector: 'app-dashboard',
	imports: [
		CommonModule,
		MatCardModule,
		MatGridListModule,
		MatIconModule,
		CalendarPreviousViewDirective,
		CalendarTodayDirective,
		CalendarNextViewDirective,
		CalendarMonthViewComponent,
		CalendarWeekViewComponent,
		CalendarDayViewComponent,
		CalendarDatePipe
	],
	providers: [
		provideCalendar({
			provide: DateAdapter,
			useFactory: adapterFactory,
		}),
	],
	templateUrl: './dashboard.html',
	styleUrl: './dashboard.scss'
})
export class Dashboard {
	kpiCards = [
		{ title: 'Servicios Hoy', value: '430', change: 32.54, isPositive: true, icon: 'engineering' },
		{ title: 'Cotizaciones', value: '360', change: -12.54, isPositive: false, icon: 'request_quote' },
		{ title: 'Facturación (Mes)', value: '43,583', change: 15.80, isPositive: true, icon: 'payments' },
		{ title: 'Toneladas (Mes)', value: '34.4', change: 5.20, isPositive: true, icon: 'scale' }
	];


	// --- Propiedades para el Calendario ---
	readonly CalendarView = CalendarView; // Para usar 'CalendarView.Month' en el HTML
	view: CalendarView = CalendarView.Month; // Vista inicial
	viewDate: Date = new Date();

	// Eventos de ejemplo
	events: CalendarEvent[] = [
		{
			start: new Date(),
			title: 'Recojo programado - Cliente A',
		},
		{
			start: new Date(new Date().setDate(new Date().getDate() + 2)), // Un evento en 2 días
			title: 'Vencimiento de Factura #123',
		}
	];

	// Métodos para el calendario
	setView(view: CalendarView) {
		this.view = view;
	}
}
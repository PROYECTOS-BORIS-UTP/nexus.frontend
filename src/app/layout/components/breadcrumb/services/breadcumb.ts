import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import { IBreadcrumbItem } from '../interfaces/IBreadcrumb-item.interface';

@Injectable({
	providedIn: 'root'
})
export class Breadcumb {
	private readonly _breadcrumbs = new BehaviorSubject<IBreadcrumbItem[]>([]);
	readonly breadcrumbs$ = this._breadcrumbs.asObservable();

	constructor(private router: Router, private activatedRoute: ActivatedRoute) {
		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)
		).subscribe(() => {
			this._breadcrumbs.next(this.createBreadcrumbs(this.activatedRoute.root));
		});
	}

	private createBreadcrumbs(route: ActivatedRoute): IBreadcrumbItem[] {
		const breadcrumbs: IBreadcrumbItem[] = [];
		let currentRoute: ActivatedRoute | null = route;
		let path = '';

		while (currentRoute) {
			const snapshot = currentRoute.snapshot;
			if (snapshot?.data['breadcrumb']) {
				const routePath = snapshot.url.map(segment => segment.path).join('/');

				if (path && routePath) {
					path += `/${routePath}`;
				} else {
					path += routePath;
				}

				const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
				if (!lastBreadcrumb || lastBreadcrumb.label !== snapshot.data['breadcrumb']) {
					breadcrumbs.push({
						label: snapshot.data['breadcrumb'],
						icon: snapshot.data['icon'],
						// --- AJUSTE CLAVE AQUÍ ---
						// Lee la propiedad 'link' de la data. Si no existe, será 'undefined'.
						link: snapshot.data['link'],
					});
				}
			}
			currentRoute = currentRoute.firstChild;
		}
		return breadcrumbs;
	}
}

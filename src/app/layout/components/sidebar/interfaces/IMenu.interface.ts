export interface IMenuItem {
    id: number | string;
    icon: string;
    tooltip: string; // Cambiado de 'tooltip' a 'title' para mayor claridad
    title: string;
    color: string;
    route?: string;
    children?: ISubMenuItem[];
}


export interface ISubMenuItem {
    label: string;
    route?: string;
    icon?: string;
    color?: string;
    children?: ISubMenuItem[];
}
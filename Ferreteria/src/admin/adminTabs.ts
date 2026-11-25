import type { ComponentType } from 'react';
import { Permission, type PermissionName } from '../auth/permissions';
import ProductListPanel from './panels/ProductListPanel';
import AddProductPanel from './panels/AddProductPanel';
import EditPricePanel from './panels/EditPricePanel';
import DeleteProductPanel from './panels/DeleteProductPanel';
import EmployeeListPanel from './panels/EmployeeListPanel';
import AddEmployeePanel from './panels/AddEmployeePanel';
import EditEmployeePanel from './panels/EditEmployeePanel';
import DeleteEmployeePanel from './panels/DeleteEmployeePanel';

export interface AdminTab {
  id: string;
  label: string;
  requiredPermission: PermissionName;
  Panel: ComponentType;
}

export const ADMIN_TABS: AdminTab[] = [
  { id: 'list-products', label: 'Listar productos', requiredPermission: Permission.manageProducts, Panel: ProductListPanel },
  { id: 'add-product', label: 'Agregar producto', requiredPermission: Permission.manageProducts, Panel: AddProductPanel },
  { id: 'edit-price', label: 'Editar precio', requiredPermission: Permission.manageProducts, Panel: EditPricePanel },
  { id: 'delete-product', label: 'Eliminar producto', requiredPermission: Permission.manageProducts, Panel: DeleteProductPanel },
  { id: 'list-employees', label: 'Listar empleados', requiredPermission: Permission.manageUsers, Panel: EmployeeListPanel },
  { id: 'add-employee', label: 'Agregar empleado', requiredPermission: Permission.manageUsers, Panel: AddEmployeePanel },
  { id: 'edit-employee', label: 'Editar empleado', requiredPermission: Permission.manageUsers, Panel: EditEmployeePanel },
  { id: 'delete-employee', label: 'Eliminar empleado', requiredPermission: Permission.manageUsers, Panel: DeleteEmployeePanel },
];

export function tabsAllowedFor(permissions: string[]): AdminTab[] {
  return ADMIN_TABS.filter((tab) => permissions.includes(tab.requiredPermission));
}

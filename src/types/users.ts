
export interface UserPrivilege {
  id: string;
  name: string;
  description: string;
  category: 'customers' | 'sales' | 'inventory' | 'accounts' | 'users' | 'settings' | 'reports' | 'suppliers' | 'other';
  enabled: boolean;
}

export type PrivilegeCategories = {
  [key in UserPrivilege['category']]: UserPrivilege[];
};

export interface UserPrivilegeGroup {
  category: UserPrivilege['category'];
  label: string;
  privileges: UserPrivilege[];
}

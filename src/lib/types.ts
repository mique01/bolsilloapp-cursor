export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other';
export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: Date;
  categoryId: string;
  category?: Category;
  paymentMethod?: PaymentMethod;
  personId?: string;
  person?: Person;
  receiptIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Person {
  id: string;
  name: string;
  email?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Receipt {
  id: string;
  name: string;
  fileURL: string;
  fileType: string;
  folderName?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  currentAmount: number;
  startDate: Date;
  endDate: Date;
  categoryId?: string;
  category?: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseGroup {
  id: string;
  name: string;
  description?: string;
  transactionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  enableSharedExpenses: boolean;
  createdAt: Date;
  updatedAt: Date;
} 
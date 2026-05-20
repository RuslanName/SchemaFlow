import type { LucideIcon } from 'lucide-react'
import {
  User,
  Users,
  Briefcase,
  FileText,
  MapPin,
  CreditCard,
  Coffee,
  Cpu,
  Tag,
  Layers,
  Image,
  Coins,
  CupSoda,
  Link2,
  Hash,
  Mail,
  Calendar,
  Wallet,
  KeyRound,
  Phone,
  FileKey,
  Gauge,
  Zap,
  Box,
  Ruler,
  Weight,
  Clock,
  ToggleLeft,
  Database,
} from 'lucide-react'
import type { ColumnMeta } from '../../../types/schema'

const TABLE_ICONS: Record<string, LucideIcon> = {
  individuals: User,
  employees: Briefcase,
  clients: Users,
  contract_addresses: MapPin,
  contracts: FileText,
  payments: CreditCard,
  coffee_machine_brands: Tag,
  coffee_machine_types: Layers,
  coffee_machine_models: Cpu,
  coffee_machines: Coffee,
  coffee_machine_photos: Image,
  coffee_machine_states: ToggleLeft,
  rental_prices: Coins,
  drinks: CupSoda,
  supported_drinks: Link2,
}

const COLUMN_ICONS: Record<string, LucideIcon> = {
  id: Hash,
  email: Mail,
  login: KeyRound,
  phone_number: Phone,
  passport_data: FileKey,
  hire_date: Calendar,
  sign_date: Calendar,
  date: Calendar,
  change_date: Calendar,
  status_change_date: Clock,
  balance: Wallet,
  monthly_payment_amount: Wallet,
  price: Coins,
  file_link: FileText,
  photo_link: Image,
  pressure: Gauge,
  power: Zap,
  chip_number: Cpu,
  width: Ruler,
  height: Ruler,
  depth: Ruler,
  weight: Weight,
  water_tank_volume: Box,
  bean_container_volume: Box,
  cups_per_hour: Coffee,
}

export function tableIcon(tableName: string): LucideIcon {
  return TABLE_ICONS[tableName] ?? Database
}

export function columnIcon(col: ColumnMeta): LucideIcon {
  if (col.foreign_key) return Link2
  return COLUMN_ICONS[col.name] ?? Database
}

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { TicketStatus } from '@ticket-registrator/shared';
import type {TicketStatusType} from '@ticket-registrator/shared';
import { ItemStatus } from '@ticket-registrator/shared';
import type { ItemStatusType } from '@ticket-registrator/shared';
import { TicketLifecycle } from '@ticket-registrator/shared';
import type { TicketLifecycleType } from "@ticket-registrator/shared";

@Schema({ _id: false })
export class Item {
  @Prop({ type: String, default: null })
  name: string | null;

  @Prop({ type: Number, default: null })
  amount: number | null;

  @Prop({ type: String, default: null })
  currency: string | null;

  @Prop({
    enum: Object.values(ItemStatus),
    default: ItemStatus.PENDING,
  })
  status: ItemStatusType;
}

export const ItemSchema = SchemaFactory.createForClass(Item);


@Schema({ timestamps: true })
export class Ticket {
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Report', required: true })
  report_id: Types.ObjectId;

  // -----------------------------
  // Lifecycle control
  // -----------------------------
  @Prop({
    enum: Object.values(TicketLifecycle),
    default: TicketLifecycle.DRAFT,
  })
  lifecycle: TicketLifecycleType;

    @Prop({ type: Number, default: 0 })
  version: number;

  // -----------------------------
  // Extracted / user-editable fields
  // -----------------------------
  @Prop({ type: String, default: null })
  cgs_bucket_link: string | null;

  @Prop({ type: String, default: null })
  payment_type: string | null;

  @Prop({ type: String, default: null })
  expense_type: string | null;

  @Prop({ type: Date, default: null })
  date: Date | null;

  @Prop({ type: String, default: null })
  location_name: string | null;

  @Prop({ type: String, default: null })
  location_address: string | null;

  @Prop({ type: Number, default: null })
  amount: number | null;

  @Prop({ type: String, default: null })
  currency: string | null;

  @Prop({ type: Number, default: null })
  converted_amount: number | null;

  @Prop({ type: String, default: null })
  converted_currency: string | null;

  @Prop({ type: String, default: null })
  cgs_bucket_link_justification: string | null;

  @Prop({ type: String, default: null })
  last_four_digits: string | null;

  // -----------------------------
  // Status & finance
  // -----------------------------
  @Prop({
    enum: Object.values(TicketStatus),
    default: TicketStatus.PENDING,
  })
  status: TicketStatusType;

  @Prop({ type: Number, default: null })
  llm_appproved_percentage: number | null;

  @Prop({ type: String, default: null })
  llm_recomendation: string | null;

  @Prop({ type: Number, default: null })
  llm_suggested_amount: number | null;

  @Prop({ type: String, default: null })
  llm_suggested_currency: string | null;

  @Prop({ type: Number, default: 0 })
  approved_amount: number;

  @Prop({ type: [ItemSchema], default: [] })
  items: Item[];

  @Prop({ type: Boolean, default: true })
  isVisible: boolean;

}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
export type TicketDocument = HydratedDocument<Ticket>;


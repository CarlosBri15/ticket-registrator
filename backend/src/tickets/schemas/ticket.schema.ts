import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ItemStatus } from "../status/item-status";
import type { ItemStatusType } from "../status/item-status";
import { TicketStatus } from "../status/ticket-status";
import type { TicketStatusType } from "../status/ticket-status";


@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ enum: ItemStatus, default: ItemStatus.PENDING })
  status: ItemStatusType;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: 'Report', required: true })
  report_id: Types.ObjectId;

  @Prop({ required: true })
  cgs_bucket_link: string;

  @Prop({ required: true })
  payment_type: string;

  @Prop({ required: true })
  expense_type: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  location_name: string;

  @Prop({ required: true })
  location_address: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  converted_amount: number;

  @Prop({ required: true })
  converted_currency: string;

  @Prop({ required: true })
  cgs_bucket_link_justification: string;

  @Prop({ required: true })
  last_four_digits: string;

  @Prop({
    required: true,
    enum: Object.values(TicketStatus),
    default: TicketStatus.PENDING,
  })
  status: TicketStatusType;

  // -----------------------------
  // LLM fields (defaults)
  // -----------------------------
  @Prop({ type: Number, default: null })
  llm_appproved_percentage: number | null;

  @Prop({ type: String, default: null })
  llm_recomendation: string | null;

  @Prop({ type: Number, default: null })
  llm_suggested_amount: number | null;
  
  @Prop({ type: String, default: null })
  llm_suggested_currency: string | null;

  // approved amount for finance approval
  @Prop({ default: 0 })
  approved_amount: number;

  @Prop({ type: [ItemSchema], default: [] })
  items: Item[];
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

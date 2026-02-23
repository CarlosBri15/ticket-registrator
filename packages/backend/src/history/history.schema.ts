// ticket-history.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class TicketHistory {
  @Prop({ type: Types.ObjectId, ref: 'Report', required: true })
  reportId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Ticket', required: true })
  ticketId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  version: number; 

  @Prop({ type: Object, required: true })
  oldSnapshot: Record<string, any>;

  @Prop({ type: Object, required: true })
  newSnapshot: Record<string, any>;

}

export const TicketHistorySchema = SchemaFactory.createForClass(TicketHistory);
export type TicketHistoryDocument = HydratedDocument<TicketHistory>;

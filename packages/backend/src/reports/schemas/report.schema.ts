import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import type { ReportStatusType } from "@ticket-registrator/shared";
import { ReportStatus } from "@ticket-registrator/shared";

export type ReportDocument = HydratedDocument<Report>;

@Schema({ timestamps: true })
export class Report {

    createdAt: Date;
    updatedAt: Date;
    
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user_id: Types.ObjectId;

    @Prop()
    name: string;

    @Prop()
    start_date: Date;

    @Prop()
    end_date: Date;

    @Prop({ type: Number, required: true, default: 0})
    requested_amount: number;

    @Prop({ type: Number, required: true, default: 0 })
    approved_amount: number;

    @Prop()
    currency: string;

    @Prop()
    type: string;

    @Prop({
        required: true,
        enum: Object.values(ReportStatus),
        default: ReportStatus.CREATED,
    })
    status: ReportStatusType;

    @Prop({ type: Boolean, default: true })
      isVisible: boolean;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
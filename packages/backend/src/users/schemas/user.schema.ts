import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import type { RoleType } from "@ticket-registrator/shared";
import { Roles } from "@ticket-registrator/shared";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    surname: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({required: true, enum: Object.values(Roles)})
    role: RoleType;

    @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
    companyId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    departmentId: Types.ObjectId;

    @Prop({ type: Boolean, default: true })
    isVisible: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
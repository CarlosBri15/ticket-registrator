import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema()
export class Department {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  departmentName: string;

  //@Prop({ default: null })
  //parentId?: string; //it should be null for top-level

  @Prop({ type: Boolean, default: true })
  isVisible: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

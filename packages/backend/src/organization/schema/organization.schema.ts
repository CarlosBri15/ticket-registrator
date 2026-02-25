import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument} from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;
@Schema()
export class Company {   

  @Prop({ required: true })
  orgName: string;

  @Prop({ type: Boolean, default: true })
  isVisible: boolean;
}
export const CompanySchema = SchemaFactory.createForClass(Company);

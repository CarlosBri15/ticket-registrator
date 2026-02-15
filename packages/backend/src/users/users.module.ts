import { Module, forwardRef} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Report, ReportSchema } from '../reports/schemas/report.schema';
import { Ticket, TicketSchema } from '../tickets/schemas/ticket.schema';
import {AuthModule} from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Report.name, schema: ReportSchema },
      { name: Ticket.name, schema: TicketSchema },
    ]),
    forwardRef(() => AuthModule), // <-- circular dependency
  ],

  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

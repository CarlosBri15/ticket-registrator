import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Report, ReportDocument } from '../reports/schemas/report.schema';
import { Ticket, TicketDocument } from '../tickets/schemas/ticket.schema';
import { MongoServerError } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { IUser } from '@ticket-registrator/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    
    @InjectModel(Report.name)
    private reportModel: Model<ReportDocument>,

    @InjectModel(Ticket.name)
    private ticketModel: Model<TicketDocument>,
  ) {}

  async create(createUserDto: CreateUserDto) : Promise<IUser> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;

    try {
      const user = new this.userModel(createUserDto);
      const savedUser = await user.save();

      // Remove password before returning response 
      return {
        id: savedUser._id.toString(),
        name: savedUser.name,
        surname: savedUser.surname,
        email: savedUser.email,
        username: savedUser.username,
      };

    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        if (error.keyPattern?.email) {
          throw new ConflictException('Email already exists');
        }
        if (error.keyPattern?.username) {
          throw new ConflictException('Username already exists');
        }
      }
      throw error;
    }
  }

  async findAll() {
    return this.userModel.find().exec();
  }

  async findOne(id: string) {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateUserDto,
        { new: true }
      );
      
      // Remove password before returning response 
      if (updatedUser) {
        const userObj = updatedUser.toObject() as any;
        delete userObj.password;
        return userObj;
      }
      return null;
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        if (error.keyPattern?.email) {
          throw new ConflictException('Email already exists');
        }
        if (error.keyPattern?.username) {
          throw new ConflictException('Username already exists');
        }
      }
      throw error;
    }
  }

  async remove(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    const reports = await this.reportModel.find(
      { user_id: user._id },
      { _id: 1 },
    );

    const reportIds = reports.map(r => r._id);

    if (reportIds.length > 0) {
      await this.ticketModel.deleteMany({
        report_id: { $in: reportIds },
      });
    }

    await this.reportModel.deleteMany({
      user_id: user._id,
    });

    await this.userModel.findByIdAndDelete(userId);
    return { deleted: true };
  }


  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
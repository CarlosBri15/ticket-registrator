import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
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
import { mapUserToIUser } from './mapper/users.mapper';

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
      return mapUserToIUser(savedUser);

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

  async findAll(): Promise<IUser[]> {
    const users = await this.userModel.find({ isVisible: true }).exec();
    return users.map(user => mapUserToIUser(user));
  }

  async findOne(id: string): Promise<IUser> {
    const user = await this.userModel.findOne({_id: id, isVisible: true}).exec();

    if (!user) {
      throw new ConflictException('User not found');
    }
    return mapUserToIUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<IUser> {
    // Hash password if present
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateUserDto,
        { new: true }
      );

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      // Map to IUser (remove password)
      return mapUserToIUser(updatedUser);
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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isVisible) {
      throw new ConflictException('User already deleted');
    }

    // Hide user
    user.isVisible = false;
    await user.save();

    // Hide reports
    const reports = await this.reportModel.find(
      { user_id: user._id },
      { _id: 1 },
    );

    const reportIds = reports.map(r => r._id);

    if (reportIds.length > 0) {
      await this.reportModel.updateMany(
        { _id: { $in: reportIds } },
        { $set: { isVisible: false } },
      );

      // Hide tickets
      await this.ticketModel.updateMany(
        { report_id: { $in: reportIds } },
        { $set: { isVisible: false } },
      );
    }

    return { deleted: true };
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
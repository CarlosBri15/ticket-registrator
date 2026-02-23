import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Report, ReportDocument } from '../reports/schemas/report.schema';
import { Ticket, TicketDocument } from '../tickets/schemas/ticket.schema';
import { Permission, PermissionDocument } from '../permissions/schema/permissions.schema';
import { Company, CompanyDocument } from '../organization/schema/organization.schema';
import { Department, DepartmentDocument } from '../department/department.schema';
import { MongoServerError } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { IUser, Roles, ROLE_DEFAULT_PERMISSIONS, ROLE_HIERARCHY } from '@ticket-registrator/shared';
import type {PermissionType} from '@ticket-registrator/shared';
import { RoleType } from '@ticket-registrator/shared';
import { mapUserToIUser } from './mapper/users.mapper';
import { AuthService } from '../auth/auth.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    
    @InjectModel(Report.name)
    private reportModel: Model<ReportDocument>,

    @InjectModel(Ticket.name)
    private ticketModel: Model<TicketDocument>,

    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,

    @InjectModel(Company.name)
    private companyModel: Model<CompanyDocument>,

    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
) {}

  async create(
    createUserDto: CreateUserDto,
    creator: {
      role: RoleType;
      companyId: string;
      departmentId: string;
      permissions: PermissionType[];
    }
  ): Promise<IUser> {
    if (!createUserDto.password) {
      throw new ConflictException('Password is required');
    }
    
    // Hash password
    createUserDto.password = await this.authService.hashPassword(createUserDto.password);

    //Permission check
    if (!creator.permissions.includes('create_users')) {
      throw new BadRequestException('You do not have permission to create users');
    }

    //Role hierarchy check
    const requestedRoleHierarchy = ROLE_HIERARCHY[createUserDto.role!];
    const creatorRoleHierarchy = ROLE_HIERARCHY[creator.role];

    if (creatorRoleHierarchy <= requestedRoleHierarchy) {
      throw new ConflictException('Cannot assign a role higher than your own role');
    }

    // Resolve company from JWT
    const company = await this.companyModel.findById(creator.companyId);
    if (!company) {
      throw new ConflictException('Creator company does not exist');
    }

    // Determine departmentId
    let departmentId: Types.ObjectId | null = null;

    if (creator.role === Roles.MANAGER) {
      if (!createUserDto.departmentId) {
        throw new BadRequestException('Department is required');
      }

      if (createUserDto.departmentId !== creator.departmentId) {
        throw new ForbiddenException(
          'Managers can only create users in their own department',
        );
      }
    }

    if (createUserDto.departmentId) {
      const department = await this.departmentModel.findOne({
        _id: new Types.ObjectId(createUserDto.departmentId),
        companyId: company._id,
      });

      if (!department) {
        throw new ConflictException('Department does not exist in this company');
      }

      departmentId = department._id;
    } else {
      departmentId = null;
    }

    const userToCreate: any = {
      ...createUserDto,
      companyId: new Types.ObjectId(company._id),
      departmentId: departmentId,
    };

    try {
      const user = new this.userModel(userToCreate);
      const savedUser = await user.save();
      const defaultPermissions = ROLE_DEFAULT_PERMISSIONS[savedUser.role];

      await this.permissionModel.create({
        userId: savedUser._id,
        permissions: defaultPermissions,
        isActive: true,
      });

      return mapUserToIUser(savedUser);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }

      if (error.code === 11000) {
        if (error.keyPattern?.email) throw new ConflictException('Email already exists');
        if (error.keyPattern?.username) throw new ConflictException('Username already exists');
      }

      throw error;
    }
  }

  async findMe(userId: string): Promise<IUser> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return mapUserToIUser(user);
  }

  async findAll(requester: {
    id: string;
    role: RoleType;
    companyId: string;
    departmentId: string;
    permissions: PermissionType[];
  }): Promise<IUser[]> {

    if (
      !requester.permissions.includes("view_all_users") &&
      !requester.permissions.includes("view_team_users")
    ) {
      throw new ForbiddenException('You are not allowed to view users');
    }

    const baseFilter: any = {
      isVisible: true,
      companyId: new Types.ObjectId(requester.companyId),
    };

    if (requester.permissions.includes("view_team_users")) {
      baseFilter.departmentId = new Types.ObjectId(requester.departmentId);
    }

    const users = await this.userModel.find(baseFilter).exec();
    return users.map(user => mapUserToIUser(user));
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requester: {
      id: string;
      role: RoleType;
      companyId: string;
      departmentId: string;
      permissions: PermissionType[];
    }
  ): Promise<IUser> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const isSelfUpdate = user._id.toString() === requester.id;
    const requesterHierarchy = ROLE_HIERARCHY[requester.role];

    // === SELF-UPDATE ===
    if (isSelfUpdate) {
      if (!requester.permissions.includes('edit_own_user_info')) {
        throw new ForbiddenException('You cannot update your own info');
      }

      // Only allow name, surname, username, email, password
      const forbiddenFields = ['role', 'departmentId', 'companyId'];
      for (const field of forbiddenFields) {
        if (field in updateUserDto) {
          throw new ForbiddenException(`You cannot update your own ${field}`);
        }
      }
    } 
    // === UPDATE OTHER USERS ===
    else {
      // Employees and Managers cannot edit other users
      if (requester.role === Roles.EMPLOYEE || requester.role === Roles.MANAGER) {
        throw new ForbiddenException('You cannot update other users');
      }

      // Company check for all updates (Admin and SuperAdmin)
      if (user.companyId.toString() !== requester.companyId) {
        throw new ForbiddenException('Cannot update users outside your company');
      }

      // Admin logic: can only edit department of lower hierarchy users
      if (requester.role === Roles.ADMIN) {
        const forbiddenFields = ['name', 'surname', 'email', 'username', 'password', 'role', 'companyId'];
        for (const field of forbiddenFields) {
          if (field in updateUserDto) {
            throw new ForbiddenException(`Admin cannot update ${field} of other users`);
          }
        }

        const targetHierarchy = ROLE_HIERARCHY[user.role];
        if (targetHierarchy >= requesterHierarchy) {
          throw new ForbiddenException('Cannot update users with equal or higher role');
        }
      }

      // SuperAdmin logic: can update everything except companyId
      if (requester.role === Roles.SUPERADMIN) {
        if ('companyId' in updateUserDto) {
          delete updateUserDto.companyId;
        }

        // Role assignment must be below hierarchy
        if (updateUserDto.role) {
          const requestedRoleHierarchy = ROLE_HIERARCHY[updateUserDto.role];
          if (requestedRoleHierarchy >= requesterHierarchy) {
            throw new ForbiddenException('Cannot assign a role equal or higher than your own role');
          }
        }
      }

      // === DEPARTMENT VALIDATION FOR ANY ROLE THAT ALLOWS IT ===
      if (updateUserDto.departmentId) {
        const department = await this.departmentModel.findOne({
          _id: new Types.ObjectId(updateUserDto.departmentId),
          companyId: requester.companyId, // must belong to same company
        });
        if (!department) {
          throw new ConflictException('Department does not exist in your company');
        }
      }
    }

    // Hash password if present
    if (updateUserDto.password) {
      updateUserDto.password = await this.authService.hashPassword(updateUserDto.password);
    }

    // Never allow company changes
    if ('companyId' in updateUserDto) {
      delete updateUserDto.companyId;
    }

    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateUserDto,
        { new: true }
      );

      if (!updatedUser) throw new NotFoundException('User not found');

      return mapUserToIUser(updatedUser);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        if (error.keyPattern?.email) throw new ConflictException('Email already exists');
        if (error.keyPattern?.username) throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }
  
  async remove(
    userId: string,
    requester: {
      id: string;
      role: RoleType;
      companyId: string;
      departmentId: string;
      permissions: PermissionType[];
    }
  ) {
    const user = await this.userModel.findById(userId);

    if (!user) throw new NotFoundException('User not found');
    if (!user.isVisible) throw new ConflictException('User already deleted');

    // Permission check
    if (!requester.permissions.includes("delete_user")) {
      throw new ForbiddenException('You do not have permission to delete users');
    }

    const requesterHierarchy = ROLE_HIERARCHY[requester.role];
    const targetHierarchy = ROLE_HIERARCHY[user.role];

    // Cannot delete equal or higher role
    if (targetHierarchy >= requesterHierarchy) {
      throw new ForbiddenException('Cannot delete users with equal or higher role');
    }

    // Company check
    if (user.companyId.toString() !== requester.companyId) {
      throw new ForbiddenException('Cannot delete users outside your company');
    }

    // Manager → only same department
    if (
      requester.role === Roles.MANAGER &&
      user.departmentId?.toString() !== requester.departmentId
    ) {
      throw new ForbiddenException('Managers can only delete users in their department');
    }

    // Soft delete user
    user.isVisible = false;
    await user.save();

    // Soft delete reports and tickets
    const reports = await this.reportModel.find({ user_id: user._id }, { _id: 1 });
    const reportIds = reports.map(r => r._id);

    if (reportIds.length > 0) {
      await this.reportModel.updateMany(
        { _id: { $in: reportIds } },
        { $set: { isVisible: false } }
      );
      await this.ticketModel.updateMany(
        { report_id: { $in: reportIds } },
        { $set: { isVisible: false } }
      );
    }

    // Soft delete permissions
    await this.permissionModel.updateMany(
      { userId: user._id },
      { $set: { isActive: false } }
    );

    return { deleted: true };
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async getUserPermissions(userId: string): Promise<PermissionDocument> {
    const permissionsDoc = await this.permissionModel.findOne({ userId: new Types.ObjectId(userId), isActive: true });
    if (!permissionsDoc) throw new NotFoundException('Permissions not found');
    return permissionsDoc;
  }



}
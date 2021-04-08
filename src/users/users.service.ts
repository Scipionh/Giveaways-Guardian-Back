import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from "./schemas/user.schema";
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import * as Moment from 'moment'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getById(userId: string): Promise<User> {
    return this.userModel.findOne({id: userId}).exec();
  }

  async updateById(userId: string, payload: any): Promise<User> {
    return this.userModel.findOneAndUpdate({id: userId}, payload).exec()
  }

  async addParticipation(userId: string, guardianId: string) {
    this.getFoughtGuardiansList(userId).then(x => {
      if(x.indexOf(guardianId) == -1) {
        this.updateFoughtGuardians(userId, guardianId);
      }
    })
  }

  private async getFoughtGuardiansList(userId: string): Promise<string[]> {
    return await this.userModel.findOne({id: userId}).exec().then(u => {
      return u.get('foughtGuardians');
    })
  }

  private async updateFoughtGuardians(userId: string, guardianId: string) {
    this.userModel.findOne({id: userId}).exec().then(u => {
      u.updateOne({$push: {foughtGuardians: guardianId}}).exec();
    })
  }
}

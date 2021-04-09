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

  async addHitpoints(userId: string, numberOfHitpoints: number): Promise<User> {
    return this.getById(userId).then(u => {
      return u.updateOne({hitPoints: u.hitPoints + numberOfHitpoints}).exec().then(() => {
        return this.getById(userId);
      });
    })
  }

  async removeHitpoints(userId: string, numberOfHitpoints: number): Promise<User> {
    return this.getById(userId).then(u => {
      return u.updateOne({hitPoints: u.hitPoints - numberOfHitpoints}).exec().then(() => {
        return this.getById(userId);
      });
    })
  }

  async getById(userId: string): Promise<UserDocument> {
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
    return await this.getById(userId).then(u => {
      return u.get('foughtGuardians');
    })
  }

  private async updateFoughtGuardians(userId: string, guardianId: string) {
    this.getById(userId).then(u => {
      u.updateOne({$push: {foughtGuardians: guardianId}}).exec();
    })
  }

  canHitGuardian(userId: string, numberOfHitPoints: number): Promise<boolean> {
    return this.getById(userId).then(u => {
      return u.hitPoints >= numberOfHitPoints;
    })
  }
}

import { InjectModel } from '@nestjs/mongoose';
import { UserS } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import * as Moment from 'moment'
import { Cooldown } from '../models/cooldown';
import { User } from './users.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(UserS.name) private readonly userModel: Model<UserS>) {}

  async create(createUserDto: CreateUserDto): Promise<UserS> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<UserS[]> {
    return this.userModel.find().exec();
  }

  async getById(userId: string): Promise<UserS> {
    return this.userModel.findOne({id: userId}).exec();
  }

  async updateById(userId: string, payload: any): Promise<UserS> {
    return this.userModel.findOneAndUpdate({id: userId}, payload).exec()
  }

  async canUseCommand(userId: string, commandName: string, cooldown: number): Promise<boolean> {
    return this.getCooldownCommand(userId, commandName).then(commandCooldown => {
      if(!commandCooldown) return true;
      const date = Moment(commandCooldown.lastUsage);
      return parseInt(Moment(Moment().diff(date)).format("m")) >= cooldown;
    });
  }

  async updateLastUsage(userId: string, commandName: string) {
    this.getCooldownCommand(userId, commandName).then(commandCooldown => {
      if(!commandCooldown) {
        return this.initializeCommandCooldown(userId, commandName);
      } else {
        return this.updateCommandCooldown(userId, commandName)
      }
    })
  }

  async addParticipation(user: User, guardianId: string) {
    this.getFoughtGuardiansList(user).then(x => {
      if(x.indexOf(guardianId) == -1) {
        this.updateFoughtGuardians(user, guardianId);
      }
    })
  }

  async getRemainingTime(userId: string, commandName: string): Promise<string> {
    return this.getCooldownCommand(userId, commandName).then(c => {
      if(c) {
        const endDate = Moment(c.lastUsage).add(5, 'minutes');
        return Moment(endDate.diff(Moment())).format("m[m] s[s]")
      }
    })
  }

  private async getFoughtGuardiansList(user: User): Promise<string[]> {
    return await this.userModel.findOne({id: user.id}).exec().then(u => {
      return u.get('foughtGuardians');
    })
  }

  private async updateFoughtGuardians(user: User, guardianId: string) {
    this.userModel.findOne({id: user.id}).exec().then(u => {
      u.updateOne({$push: {foughtGuardians: guardianId}}).exec();
    })
  }

  private async getCooldownCommand(userId: string, commandName: string): Promise<Cooldown> {
    return this.userModel.findOne({id: userId}).exec().then(x => {
      if(x) {
        return x.commandsCooldown.find(y => y.command === commandName)
      }
    });
  }

  private async initializeCommandCooldown(userId: string, commandName: string) {
    return await this.userModel.findOne({id: userId}).exec().then(x => {
      x.updateOne({commandsCooldown: {command: commandName, lastUsage: Moment().format()}}).exec();
      return x.save();
    });
  }

  private async updateCommandCooldown(userId: string, commandName: string) {
    return await this.userModel.findOne({id: userId}).exec().then(x => {
      x.collection.findOneAndUpdate({"commandsCooldown.command": commandName}, {$set: {"commandsCooldown.$.lastUsage": Moment().format()}});
      return x.save();
    });
  }
}
